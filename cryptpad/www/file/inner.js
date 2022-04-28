define([
    'jquery',
    '/common/toolbar.js',
    '/bower_components/nthen/index.js',
    '/common/sframe-common.js',
    '/common/common-hash.js',
    '/common/common-interface.js',
    '/customize/messages.js',

    '/common/media-tag.js',

    '/bower_components/file-saver/FileSaver.min.js',

    'css!/bower_components/bootstrap/dist/css/bootstrap.min.css',
    'css!/bower_components/components-font-awesome/css/font-awesome.min.css',
    'less!/file/app-file.less',

], function (
    $,
    Toolbar,
    nThen,
    SFCommon,
    Hash,
    UI,
    Messages,
    MediaTag)
{
    var saveAs = window.saveAs;
    var Nacl = window.nacl;

    var APP = window.APP = {};

    var andThen = function (common) {
        var $appContainer = $('#cp-app-file-content');
        var $form = $('#cp-app-file-upload-form');
        var $dlview = $('#cp-app-file-download-view');
        var $label = $form.find('button');
        var $bar = $('.cp-toolbar-container');
        var $body = $('body');

        $body.on('dragover', function (e) { e.preventDefault(); });
        $body.on('drop', function (e) { e.preventDefault(); });

        var uploadMode = false;
        var secret;
        var metadataMgr = common.getMetadataMgr();
        var priv = metadataMgr.getPrivateData();
        var fileHost = priv.fileHost || priv.origin || '';

        if (!priv.filehash) {
            uploadMode = true;
        } else {
            secret = Hash.getSecrets('file', priv.filehash, priv.password);
            if (!secret.keys) { throw new Error("You need a hash"); }
        }

        var Title = common.createTitle({});
        var displayed = ['useradmin', 'newpad', 'limit', 'upgrade', 'notifications'];
        if (!uploadMode) {
            displayed.push('fileshare');
            displayed.push('access');
        }
        var configTb = {
            displayed: displayed,
            $container: $bar,
            metadataMgr: metadataMgr,
            sfCommon: common,
        };
        if (uploadMode) {
            displayed.push('pageTitle');
            configTb.pageTitle = Messages.upload_title;
        }
        var toolbar = APP.toolbar = Toolbar.create(configTb);

        if (!uploadMode) {
            (function () {
                var hexFileName = secret.channel;
                var src = fileHost + Hash.getBlobPathFromHex(hexFileName);
                var key = secret.keys && secret.keys.cryptKey;
                var cryptKey = Nacl.util.encodeBase64(key);

                var $mt = $dlview.find('media-tag');
                $mt.attr('src', src);
                $mt.attr('data-crypto-key', 'cryptpad:'+cryptKey);
                $mt.css('transform', 'scale(2)');

                var rightsideDisplayed = false;
                var metadataReceived = false;
                UI.removeLoadingScreen();
                $dlview.show();

                MediaTag($mt[0]).on('complete', function (decrypted) {
                    $mt.css('transform', '');
                    if (!rightsideDisplayed) {
                        toolbar.$drawer
                        .append(common.createButton('export', true, {}, function () {
                            saveAs(decrypted.content, decrypted.metadata.name);
                        }));
                        rightsideDisplayed = true;
                    }

                    // make pdfs big
                    var toolbarHeight = $('#cp-toolbar').height();
                    $('media-tag iframe').css({
                        'height': 'calc(100vh - ' + toolbarHeight + 'px)',
                        'width': '100vw',
                        'position': 'absolute',
                        'bottom': 0,
                        'left': 0,
                        'border': 0
                    });
                }).on('metadata', function (metadata) {
                    if (metadataReceived) { return; }
                    metadataReceived = true;
                    // Add pad attributes when the file is saved in the drive
                    Title.onTitleChange(function () {
                        var owners = metadata.owners;
                        if (owners) { common.setPadAttribute('owners', owners); }
                        common.setPadAttribute('fileType', metadata.type);
                    });
                    $(document).on('cpPadStored', function () {
                        var owners = metadata.owners;
                        if (owners) { common.setPadAttribute('owners', owners); }
                        common.setPadAttribute('fileType', metadata.type);
                    });

                    // Save to the drive or update the acces time
                    var title = document.title = metadata.name;
                    Title.updateTitle(title || Title.defaultTitle);

                    var owners = metadata.owners;
                    if (owners) {
                        common.setPadAttribute('owners', owners);
                    }
                    if (metadata.type) {
                        common.setPadAttribute('fileType', metadata.type);
                    }

                    toolbar.addElement(['pageTitle'], {
                        pageTitle: title,
                        title: Title.getTitleConfig(),
                    });
                    toolbar.$drawer.append(common.createButton('forget', true));
                    toolbar.$drawer.append(common.createButton('properties', true));
                    if (common.isLoggedIn()) {
                        toolbar.$drawer.append(common.createButton('hashtag', true));
                    }
                    toolbar.$file.show();
                }).on('error', function (err) {
                    $appContainer.css('background-color',
                                      common.getAppConfig().appBackgroundColor);
                    UI.warn(Messages.error);
                    console.error(err);
                });
            })();
            return;
        }

        common.setTabTitle(Messages.uploadButton);
        // we're in upload mode
        if (!common.isLoggedIn()) {
            UI.removeLoadingScreen();
            return UI.alert(Messages.upload_mustLogin, function () {
                common.setLoginRedirect('login');
            });
        }

        var todo = function () {
            $label.click(function () {
                $form.find('input[type="file"]').click();
            });

            $form.css({
                display: 'block',
            });

            var fmConfig = {
                dropArea: $form,
                hoverArea: $label,
                body: $body,
                keepTable: true // Don't fadeOut the table with the uploaded files
            };

            var FM = common.createFileManager(fmConfig);

            $form.find("#cp-app-file-upfile").on('change', function (e) {
                var file = e.target.files[0];
                FM.handleFile(file);
            });

            UI.removeLoadingScreen();
        };

        var checkOnline = function () {
            var priv = metadataMgr.getPrivateData();
            if (priv.offline) { return; }
            metadataMgr.off('change', checkOnline);
            todo();
        };
        if (priv.offline) {
            metadataMgr.onChange(checkOnline);
            return;
        }
        todo();
    };

    var main = function () {
        var common;

        nThen(function (waitFor) {
            $(waitFor(function () {
                UI.addLoadingScreen();
            }));
            SFCommon.create(waitFor(function (c) { APP.common = common = c; }));
        }).nThen(function (/*waitFor*/) {
            common.getSframeChannel().onReady(function () {
                andThen(common);
            });
        });
    };
    main();
});

define([
    '/common/hyperscript.js',
    '/customize/messages.js',
    '/customize/pages.js'
], function (h, Msg, Pages) {
    return function () {
        document.title = Msg.footer_tos;
        return h('div#cp-main', [
            Pages.infopageTopbar(),
            h('div.container.cp-container', [
                h('.row.cp-page-title', h('h1', Msg.tos_title)),
                h('.row', [
                    h('p', Msg.tos_legal),
                    h('p', Msg.tos_availability),
                    h('p', Msg.tos_e2ee),
                    h('p', Msg.tos_logs),
                    h('p', Msg.tos_3rdparties),
                ])
            ]),
            Pages.infopageFooter()
        ]);
    };
});


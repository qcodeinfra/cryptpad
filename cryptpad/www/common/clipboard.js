define(['jquery'], function ($) {
    var Clipboard = {};

    var copy = function (text, multiline) {
        var $ta = $('<input>', {
            type: 'text',
        }).val(text);

        if (multiline) {
            $ta = $('<textarea>').val(text);
        }

        $('body').append($ta);

        if (!($ta.length && $ta[0].select)) {
            // console.log("oops");
            return;
        }

        var success = false;
        try {
            $ta[0].select();
            document.execCommand('copy');
            $ta[0].blur();
            success = true;
        } catch (err) {
            console.log("error, could not copy to clipboard");
        }
        $ta.remove();

        return success;
    };

    // copy arbitrary text to the clipboard
    // return boolean indicating success
    Clipboard.copy = function (text) {
        return copy(text);
    };

    Clipboard.copy.multiline = function (text) {
        return copy(text, true);
    };

    return Clipboard;
});

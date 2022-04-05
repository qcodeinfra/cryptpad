define([
    'jquery',
    '/lib/datepicker/flatpickr.js',

    'css!/lib/datepicker/flatpickr.min.css',
], function ($, Flatpickr) {
    var createRangePicker = function (cfg) {
        var start = cfg.startpicker;
        var end = cfg.endpicker;

        var is24h = false
        var dateFormat = "Y-m-d H:i";
        try {
            is24h = !new Intl.DateTimeFormat(navigator.language, { hour: 'numeric' }).format(0).match(/AM/);
        } catch (e) {}
        if (!is24h) { dateFormat = "Y-m-d h:i K"; }

        var e = $(end.input)[0];
        var endPickr = Flatpickr(e, {
            enableTime: true,
            time_24hr: is24h,
            dateFormat: dateFormat,
            minDate: start.date
        });
        endPickr.setDate(end.date);

        var s = $(start.input)[0];
        var startPickr = Flatpickr(s, {
            enableTime: true,
            time_24hr: is24h,
            dateFormat: dateFormat,
            onChange: function () {
                endPickr.set('minDate', startPickr.parseDate(s.value));
            }
        });
        startPickr.setDate(start.date);
        window.CP_startPickr = startPickr;
        window.CP_endPickr = endPickr;

        var getStartDate = function () {
            setTimeout(function () { $(startPickr.calendarContainer).remove(); });
            return startPickr.parseDate(s.value);
        };
        var getEndDate = function () {
            setTimeout(function () { $(endPickr.calendarContainer).remove(); });
            return endPickr.parseDate(e.value);
        };

        return {
            getStartDate: getStartDate,
            getEndDate: getEndDate,
        };
    };
    return {
        createRangePicker: createRangePicker
    };
});

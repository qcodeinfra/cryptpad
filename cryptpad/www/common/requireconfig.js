define([
    '/api/config'
], function (ApiConfig) {
    var out = {
        // fix up locations so that relative urls work.
        baseUrl: window.location.pathname,
        paths: { 
            // json plugin
            text: '/bower_components/requirejs-plugins/lib/text',
            json: '/bower_components/requirejs-plugins/src/json',
            optional: '/lib/optional/optional',
            // jquery declares itself as literally "jquery" so it cannot be pulled by path :(
            "jquery": "/bower_components/jquery/dist/jquery.min",
            "mermaid": "/lib/mermaid/mermaid.min",
            // json.sortify same
            "json.sortify": "/bower_components/json.sortify/dist/JSON.sortify",
            cm: '/bower_components/codemirror',
            'tui-code-snippet': '/lib/calendar/tui-code-snippet.min',
            'tui-date-picker': '/lib/calendar/date-picker',
            'netflux-client': '/bower_components/netflux-websocket/netflux-client',
            'chainpad-netflux': '/bower_components/chainpad-netflux/chainpad-netflux',
            'chainpad-listmap': '/bower_components/chainpad-listmap/chainpad-listmap',
        },
        map: {
            '*': {
                'css': '/bower_components/require-css/css.js',
                'less': '/common/RequireLess.js',
            }
        }
    };
    Object.keys(ApiConfig.requireConf).forEach(function (k) { out[k] = ApiConfig.requireConf[k]; });
    return function () {
        return JSON.parse(JSON.stringify(out));
    };
});

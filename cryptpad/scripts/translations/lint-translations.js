var EN = require("../../www/common/translations/messages.json");

var simpleTags = [
    '<br>',
    '<a href="/login/">',
    '<a href="/register/">',

    // FIXME
    "<a href='#'>",
    '<a href="#docs">',
    '<h3>',
    '</h3>',

    // FIXME register_notes
    '<ul class="cp-notes-list">',
    '</ul>',
    '<span class="red">',
    '</span>',
];

['a', 'b', 'em',/* 'p',*/ 'i', 'code', 'li',].forEach(function (tag) {
    simpleTags.push('<' + tag + '>');
    simpleTags.push('</' + tag + '>');
});

var found_tags = {};

// these keys are known to be problematic
var KNOWN_ISSUES = [ // FIXME
    //'newVersion',
    //'fm_info_anonymous',
    //'register_notes',
];

var special_rules = {};

special_rules.en = function (s) {
    // Prefer the american -ize suffix for verbs rather than -ise
    return /[^w]ise(\s|$)/.test(s);
};

special_rules.fr = function (s) {
/*
    hacky regexp to check whether there are any instances of ':'
    which do not have the preceding space as is expected.
    ignore instances where the following character is a '/'
    because this is probably a URL (http(s)://)
*/
    return /\S[:;\?\!][^\/]{1,}/.test(s);
};

var noop = function () {};

var processLang = function (map, lang, primary) {
    var announced = false;
    var announce = function () {
        if (announced) { return; }
        announced = true;
        console.log("NEXT LANGUAGE: ", lang);
    };

    var special = special_rules[lang] || noop;
    Object.keys(map).forEach(function (k) {
        if (!EN[k]) { return; }
        if (KNOWN_ISSUES.indexOf(k) !== -1) { return; }

        var s = map[k];
        if (typeof(s) !== 'string') { return; }
        var usesHTML;

        s.replace(/<[\s\S]*?>/g, function (html) {
            if (simpleTags.includes(html)) {
                found_tags[html] = 1;
                return;
            }
            announce();
            usesHTML = true;
            if (!primary) {
                console.log("{%s}", html);
            }
        });

        var weirdCapitalization;
        s.replace(/cryptpad(\.fr|\.org)*/gi, function (brand) {
            if (['CryptPad', 'cryptpad.fr', 'cryptpad.org'].includes(brand)) { return; }
            weirdCapitalization = true;
        });

        var specialViolation = special(s);

        if (usesHTML || weirdCapitalization || specialViolation) {
            announce();
            console.log("%s", s);
            console.log("[%s]\n", k);
        }
    });
};

processLang(EN, 'en', true);

[
  'ar',
  //'bn_BD',
  'ca',
  'cs',
  'de',
  'es',
  'eu',
  'fi',
  'fr',
  'hi',
  'it',
  'ja',
  'nb',
  'nl',
  'pl',
  'pt-br',
  'ro',
  'ru',
  'sv',
  //'te',
  'tr',
  'uk',
  'zh',
].forEach(function (lang) {
    try {
        var map = require("../../www/common/translations/messages." + lang + ".json");
        if (!Object.keys(map).length) { return; }
        processLang(map, lang);
    } catch (err) {
        console.error(err);
    }
});

simpleTags.forEach(html => {
    if (found_tags[html]) { return; }
    console.log(`html exemption '${html}' is unnecessary.`);
});

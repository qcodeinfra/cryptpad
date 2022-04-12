// see all options in www/common/application_config_internal.js
define(['/common/application_config_internal.js'], function (AppConfig) {
    // remove the survey link in the menu
    AppConfig.surveyURL = "";

    // show all app types in document creation dialog
    AppConfig.hiddenTypes = [];

    // enable OnlyOffice docs and preso support
    AppConfig.enableEarlyAccess = true;

    // user passwords are hashed with scrypt, and salted with their username.
    // this value will be appended to the username, causing the resulting hash
    // to differ from other CryptPad instances if customized.
    AppConfig.loginSalt = '';
    AppConfig.minimumPasswordLength = 8;

    return AppConfig;
});

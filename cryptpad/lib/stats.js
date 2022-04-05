/*jshint esversion: 6 */
const Stats = module.exports;

var truthyStringOrNothing = function (s) {
    if (typeof(s) !== 'string' || !s) { return undefined; }
    return s.trim() || undefined;
};

Stats.instanceData = function (Env) {
    var data = {
        version: Env.version,
        installMethod: Env.installMethod,

        domain: Env.myDomain,
        subdomain: Env.mySubdomain,

        httpUnsafeOrigin: Env.httpUnsafeOrigin,
        httpSafeOrigin: Env.httpSafeOrigin,

        adminEmail: Env.consentToContact? Env.adminEmail: undefined,
        consentToContact: Boolean(Env.consentToContact),

        instancePurpose: Env.instancePurpose === 'noanswer'? undefined: Env.instancePurpose,
    };

/*  We reserve the right to choose not to include instances
    in our public directory at our discretion.

    The following details will be included in your telemetry
    as factors that may contribute to that decision.

    These values are publicly available via /api/config
    posting them to our server just makes it easier for us.
*/
    if (Env.listMyInstance) {
        // clearly indicate that you want to be listed
        data.listMyInstance = Env.listMyInstance;

        // you should have enabled your admin panel
        data.adminKeys = Env.admins.length > 0;

        // we expect that you enable your support mailbox
        data.supportMailbox = Boolean(Env.supportMailbox);

        // do you allow registration?
        data.restrictRegistration = Boolean(Env.restrictRegistration);

        // have you removed the donate button?
        data.removeDonateButton = Boolean(Env.removeDonateButton);

        // after how long do you consider a document to be inactive?
        data.inactiveTime = Env.inactiveTime;

        // how much storage do you offer to registered users?
        data.defaultStorageLimit = Env.defaultStorageLimit;

        // what size file upload do you permit
        data.maxUploadSize = Env.maxUploadSize;

        // how long do you retain inactive accounts?
        data.accountRetentionTime = Env.accountRetentionTime;

        // does this instance have a name???
        data.instanceName = truthyStringOrNothing(Env.instanceName);

        // does this instance have a jurisdiction ???
        data.instanceJurisdiction = truthyStringOrNothing(Env.instanceJurisdiction);

        // does this instance have a description???
        data.instanceDescription = truthyStringOrNothing(Env.instanceDescription);

        // how long do you retain archived data?
        //data.archiveRetentionTime = Env.archiveRetentionTime,
    }

    // we won't consider instances for public listings
    // unless they opt to provide more info about themselves
    if (!Env.provideAggregateStatistics) { return data; }

    return data;
};


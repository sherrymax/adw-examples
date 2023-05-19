/*
 * Copyright 2005-2018 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

require('@alfresco/adf-cli/tooling').dotenvConfig();
const { getIdentityProxy, getShareProxy, getApsProxy, getMicrosoftOfficeProxy } = require('../../proxy-helpers');

if (process.env.BASE_URL === undefined) {
    console.error('Please provide BASE_URL inside your .env file!');
    process.exit(1);
}

const legacyHost = process.env.APP_CONFIG_ECM_HOST;
const apsHost = process.env.BASE_URL;

module.exports = {
    ...getIdentityProxy(legacyHost),
    ...getShareProxy(legacyHost),
    ...getApsProxy(apsHost),
    ...getMicrosoftOfficeProxy(legacyHost)
}

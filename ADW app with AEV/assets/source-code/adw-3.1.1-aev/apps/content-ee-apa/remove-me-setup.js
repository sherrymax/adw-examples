#!/usr/bin/env node

// DO NOT ADD ANYTHING TO THIS FILE, WE WANT TO REMOVE IT
// DO NOT ADD ANYTHING TO THIS FILE, WE WANT TO REMOVE IT
// DO NOT ADD ANYTHING TO THIS FILE, WE WANT TO REMOVE IT

require('@alfresco/adf-cli/tooling').dotenvConfig();
const forgeAppConfigJson = require('../../setup-helpers-remove-me').forgeAppConfigJson;

// APA
forgeAppConfigJson(
    `${process.env.THIS_PROJECT_SOURCE_ROOT_PATH}/app.config.json.tpl`,
    `${process.env.THIS_PROJECT_ROOT_PATH}/.tmp/app.config.json.tpl`,
    `${process.cwd()}/libs/content-ee/process-services-cloud-extension/src/app.config-extension.json.tpl`
);

const { join } = require('path');
const getBaseKarmaConfig = require('../../../karma.conf');

module.exports = function (config) {
const baseConfig = getBaseKarmaConfig();
config.set({
    ...baseConfig,
    coverageIstanbulReporter: {
        ...baseConfig.coverageIstanbulReporter,
        dir: require('path').join(__dirname, 'coverage'),
        dir: join(__dirname, '../../../coverage/libs/content-ee/microsoft-office-online-integration-extension'),
    },
    proxies: {
        "/assets/adf-core/i18n/en.json": "node_modules/@alfresco/adf-core/bundles/assets/adf-core/i18n/en.json",
        "/app.config.json": "node_modules/@alfresco/adf-core/bundles/assets/adf-core/i18n/en.json",
        "/assets/adf-core/i18n/en-GB.json": "node_modules/@alfresco/adf-core/bundles/assets/adf-core/i18n/en.json",
        "/assets/adf-content-services/i18n/en.json": "node_modules/@alfresco/adf-core/bundles/assets/adf-core/i18n/en.json",
        "/assets/icons/ic_pencil.svg": "libs/content-ee/microsoft-office-online-integration-extension/assets/icons/ic_pencil.svg",
        "/assets/adf-core/i18n/en-US.json": "node_modules/@alfresco/adf-core/bundles/assets/adf-core/i18n/en.json",
    },
});
};

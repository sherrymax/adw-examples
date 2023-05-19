const { join } = require('path');
const getBaseKarmaConfig = require('../../../karma.conf');

module.exports = function (config) {
const baseConfig = getBaseKarmaConfig();
config.set({
    ...baseConfig,
    coverageIstanbulReporter: {
        ...baseConfig.coverageIstanbulReporter,
        dir: require('path').join(__dirname, 'coverage'),
        dir: join(__dirname, '../../../coverage/libs/content-ee/content-services-extension'),
    },
    proxies: {
        "/assets/adf-core/i18n/en.json": "node_modules/@alfresco/adf-core/bundles/assets/adf-core/i18n/en.json",
        "/assets/images/baseline-library_books-24px.svg": "node_modules/@alfresco/adf-core/bundles/assets/adf-core/i18n/en.json",
        "/undefined": "node_modules/@alfresco/adf-core/bundles/assets/adf-core/i18n/en.json",
    }
});
};

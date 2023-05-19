const { join } = require('path');
const getBaseKarmaConfig = require('../../../karma.conf');

module.exports = function (config) {
const baseConfig = getBaseKarmaConfig();
config.set({
    ...baseConfig,
    coverageIstanbulReporter: {
        ...baseConfig.coverageIstanbulReporter,
        dir: require('path').join(__dirname, 'coverage'),
        dir: join(__dirname, '../../../coverage/libs/content-ee/government-extension'),
    },
    proxies: {
        '/bpm/activiti-app/api/enterprise/runtime-app-definitions': 'node_modules/@alfresco/adf-core/bundles/assets/adf-core/i18n/en.json',
    },
});
};

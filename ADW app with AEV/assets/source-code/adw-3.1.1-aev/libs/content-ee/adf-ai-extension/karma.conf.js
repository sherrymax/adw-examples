const { join } = require('path');
const getBaseKarmaConfig = require('../../../karma.conf');

module.exports = function (config) {
const baseConfig = getBaseKarmaConfig();
config.set({
    ...baseConfig,
    coverageIstanbulReporter: {
        ...baseConfig.coverageIstanbulReporter,
        dir: require('path').join(__dirname, 'coverage'),
        dir: join(__dirname, '../../../coverage/libs/content-ee/ai-services-extension'),
    },
});
};

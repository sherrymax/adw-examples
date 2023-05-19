/* eslint-disable */
export default {
    displayName: 'monorepo-builders',
    preset: '../../../jest.preset.js',
    transform: {
        '^.+\\.[tj]sx?$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    coverageDirectory: '../../../coverage/libs/monorepo/builders',
    projects: [__dirname],
    testEnvironment: 'node',
};

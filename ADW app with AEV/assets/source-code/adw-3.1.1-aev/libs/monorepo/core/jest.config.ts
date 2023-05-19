/* eslint-disable */
export default {
    displayName: 'monorepo-core',
    preset: '../../../jest.preset.js',
    transform: {
        '^.+\\.[tj]sx?$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    coverageDirectory: '../../../coverage/libs/monorepo/core',
    projects: [__dirname],
    testEnvironment: 'node',
};

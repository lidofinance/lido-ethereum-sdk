import type { JestConfigWithTsJest } from 'ts-jest';

const jestConfig: JestConfigWithTsJest = {
  displayName: 'LidoSDK tests',
  testEnvironment: 'node',
  preset: 'ts-jest',
  verbose: true,

  detectOpenHandles: true,
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.json',
        useESM: true,
      },
    ],
  },
  maxWorkers: 1,
  globalSetup: '<rootDir>/tests/global-setup.cjs',
  testTimeout: 300_000,
};

export default jestConfig;

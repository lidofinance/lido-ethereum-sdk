import type { JestConfigWithTsJest } from 'ts-jest';

const jestConfig: JestConfigWithTsJest = {
  displayName: 'LidoSDK tests',
  testEnvironment: 'node',
  // fix for leftover handles when running locally on macos
  forceExit: true,
  preset: 'ts-jest',
  verbose: false,
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
  globalTeardown: '<rootDir>/tests/global-teardown.cjs',
  testTimeout: 60_000,
  testPathIgnorePatterns: ['.*-snapshot\\.ts$'],
  coveragePathIgnorePatterns: ['node_modules/', '.*snapshot.*\\.ts$'],
};

export default jestConfig;

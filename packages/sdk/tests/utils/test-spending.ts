import { test, xtest } from '@jest/globals';
import { useTestsEnvs } from './fixtures/use-test-envs.js';

const { skipSpendingTests } = useTestsEnvs();

export const SPENDING_TIMEOUT = 1000 * 60 * 5;

// Pollute test.skip with missing fields so that it can be stand in for test
(test.skip as any).concurrent = xtest;
(test.skip as any).only = xtest;
(test.skip as any).skip = xtest;
(test.skip as any).todo = xtest;

type TestType = typeof test;
export const testSpending: TestType = skipSpendingTests
  ? (test.skip as TestType)
  : test;

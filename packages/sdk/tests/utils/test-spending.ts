import { test } from 'vitest';
import { useTestsEnvs } from './fixtures/use-test-envs.js';

const { skipSpendingTests } = useTestsEnvs();

export const SPENDING_TIMEOUT = 120_000;

type TestType = typeof test;
export const testSpending: TestType = skipSpendingTests
  ? (test.skip as TestType)
  : test;

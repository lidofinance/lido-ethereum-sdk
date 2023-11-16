import { test } from '@jest/globals';
import { useTestsEnvs } from './use-test-envs.js';

const { skipSpendingTests } = useTestsEnvs();

export const SPENDING_TIMEOUT = 1000 * 60 * 5;

export const testSpending = skipSpendingTests ? test.skip : test;

import { describe, jest } from '@jest/globals';
import { useStake } from '../../../tests/utils/fixtures/use-stake.js';
import {
  SPENDING_TIMEOUT,
  testSpending,
} from '../../../tests/utils/test-spending.js';
import { expectTxCallback } from '../../../tests/utils/expect/expect-tx-callback.js';
import { expectAlmostEqualBn } from '../../../tests/utils/expect/expect-bn.js';
import { useSteth } from '../../../tests/utils/fixtures/use-steth.js';

describe('LidoSDKStake wallet methods', () => {
  const stake = useStake();
  const steth = useSteth();
  testSpending(
    'can stake',
    async () => {
      const stakeValue = 100n;
      const balanceBefore = await steth.balance();
      const mockTxCallback = jest.fn();
      const tx = await stake.stakeEth({
        value: stakeValue,
        callback: mockTxCallback,
      });
      expectTxCallback(mockTxCallback, tx);
      const balanceAfter = await steth.balance();
      // due to protocol rounding error this can happen
      expectAlmostEqualBn(balanceAfter - balanceBefore, stakeValue);
    },
    SPENDING_TIMEOUT,
  );
});

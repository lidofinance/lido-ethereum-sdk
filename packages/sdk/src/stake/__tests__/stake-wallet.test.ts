import { describe, jest, expect } from '@jest/globals';
import { useStake } from '../../../tests/utils/fixtures/use-stake.js';
import {
  SPENDING_TIMEOUT,
  testSpending,
} from '../../../tests/utils/test-spending.js';
import { expectTxCallback } from '../../../tests/utils/expect/expect-tx-callback.js';
import { expectAlmostEqualBn } from '../../../tests/utils/expect/expect-bn.js';
import { useSteth } from '../../../tests/utils/fixtures/use-steth.js';
import { useShares } from '../../../tests/utils/fixtures/use-shares.js';

describe('LidoSDKStake wallet methods', () => {
  const stake = useStake();
  const steth = useSteth();
  const shares = useShares();
  testSpending(
    'can stake',
    async () => {
      const stakeValue = 100n;
      const balanceBefore = await steth.balance();
      const balanceSharesBefore = await shares.balance();
      const mockTxCallback = jest.fn();
      const tx = await stake.stakeEth({
        value: stakeValue,
        callback: mockTxCallback,
      });
      expectTxCallback(mockTxCallback, tx);
      const balanceAfter = await steth.balance();
      const balanceSharesAfter = await shares.balance();
      const balanceDiff = balanceAfter - balanceBefore;
      const balanceSharesDiff = balanceSharesAfter - balanceSharesBefore;
      // due to protocol rounding error this can happen
      expectAlmostEqualBn(balanceDiff, stakeValue);
      expect(tx.result).toBeDefined();
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const result = tx.result!;
      expectAlmostEqualBn(result.stethReceived, balanceDiff);
      expect(result.sharesReceived).toEqual(balanceSharesDiff);
    },
    SPENDING_TIMEOUT,
  );
});

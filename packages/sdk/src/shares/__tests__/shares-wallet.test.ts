import { describe, expect, jest } from '@jest/globals';
import { useSteth } from '../../../tests/utils/fixtures/use-steth.js';
import {
  SPENDING_TIMEOUT,
  testSpending,
} from '../../../tests/utils/test-spending.js';
import { useShares } from '../../../tests/utils/fixtures/use-shares.js';
import {
  useAccount,
  useAltAccount,
} from '../../../tests/utils/fixtures/use-wallet-client.js';
import { expectTxCallback } from '../../../tests/utils/expect/expect-tx-callback.js';
import { expectAlmostEqualBn } from '../../../tests/utils/expect/expect-bn.js';

describe('LidoSDKStake wallet methods', () => {
  const steth = useSteth();
  const shares = useShares();
  const { address } = useAccount();
  const alt = useAltAccount();

  testSpending(
    'can transfer shares',
    async () => {
      const amount = 100n;
      const amountSteth = await shares.convertToShares(amount);
      const balanceStethBefore = await steth.balance(address);
      const balanceSharesBefore = await shares.balance(address);
      const mockTxCallback = jest.fn();
      const tx = await shares.transfer({
        amount,
        to: alt.address,
        callback: mockTxCallback,
      });
      expectTxCallback(mockTxCallback, tx);

      const balanceStethAfter = await steth.balance(address);
      const balanceSharesAfter = await shares.balance(address);
      expect(balanceSharesAfter - balanceSharesBefore).toEqual(-amount);
      // due to protocol rounding error this can happen
      expectAlmostEqualBn(balanceStethAfter - balanceStethBefore, -amountSteth);
    },
    SPENDING_TIMEOUT,
  );
});

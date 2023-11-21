import { describe, jest } from '@jest/globals';
import { useStake } from '../../../tests/utils/fixtures/use-stake.js';
import {
  SPENDING_TIMEOUT,
  testSpending,
} from '../../../tests/utils/test-spending.js';
import { LidoSDKstETH } from '../../index.js';
import { expectTxCallback } from '../../../tests/utils/expect/expect-tx-callback.js';
import { expectAlmostEqualBn } from '../../../tests/utils/expect/expect-bn.js';

describe('LidoSDKStake wallet methods', () => {
  const stake = useStake();

  testSpending(
    'can stake',
    async () => {
      const address = await stake.core.getWeb3Address();
      const steth = new LidoSDKstETH({ core: stake.core });
      const stakeValue = 100n;
      const balanceBefore = await steth.balance(address);
      const mockTxCallback = jest.fn();
      const tx = await stake.stakeEth({
        value: stakeValue,
        callback: mockTxCallback,
      });
      expectTxCallback(mockTxCallback, tx);
      const balanceAfter = await steth.balance(address);
      // due to protocol rounding error this can happen
      expectAlmostEqualBn(balanceAfter - balanceBefore, stakeValue);
    },
    SPENDING_TIMEOUT,
  );
});

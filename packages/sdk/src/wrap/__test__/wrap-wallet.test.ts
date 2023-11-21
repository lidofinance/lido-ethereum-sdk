import { describe, expect, jest } from '@jest/globals';
import {
  SPENDING_TIMEOUT,
  testSpending,
} from '../../../tests/utils/test-spending.js';
import { useWrap } from '../../../tests/utils/fixtures/use-wrap.js';
import { expectTxCallback } from '../../../tests/utils/expect/expect-tx-callback.js';
import { useAccount } from '../../../tests/utils/fixtures/use-wallet-client.js';
import {
  LIDO_CONTRACT_NAMES,
  LidoSDKStake,
  LidoSDKstETH,
  LidoSDKwstETH,
} from '../../index.js';
import { expectAddress } from '../../../tests/utils/expect/expect-address.js';
import {
  expectPopulatedTx,
  expectPopulatedTxToRun,
} from '../../../tests/utils/expect/expect-populated-tx.js';
import { expectAlmostEqualBn } from '../../../tests/utils/expect/expect-bn.js';

describe('LidoSDKWrap wallet methods', () => {
  const wrap = useWrap();
  const { address } = useAccount();
  const value = 100n;
  const stake = new LidoSDKStake({ core: wrap.core });
  const steth = new LidoSDKstETH({ core: wrap.core });
  const wsteth = new LidoSDKwstETH({ core: wrap.core });
  let wstethValue = 0n;

  jest.setTimeout(SPENDING_TIMEOUT);

  testSpending('stake', async () => {
    // we have to account for
    await stake.stakeEth({ value: value + 10n });
  });

  testSpending('reset allowance', async () => {
    const mock = jest.fn();
    const tx = await wrap.approveStethForWrap({ value: 0n, callback: mock });
    expectTxCallback(mock, tx);
    await expect(wrap.getStethForWrapAllowance(address)).resolves.toEqual(0n);
  });

  testSpending.failing('simulate  failing', async () => {
    await wrap.wrapStethSimulateTx({ value });
  });

  testSpending('set allowance', async () => {
    const mock = jest.fn();
    const tx = await wrap.approveStethForWrap({ value, callback: mock });
    expectTxCallback(mock, tx);
    await expect(wrap.getStethForWrapAllowance(address)).resolves.toEqual(
      value,
    );
  });

  testSpending('wrap steth populate', async () => {
    const wstethAddress = await wrap.core.getContractAddress(
      LIDO_CONTRACT_NAMES.wsteth,
    );
    const tx = await wrap.wrapStethPopulateTx({ value });
    expectAddress(tx.to, wstethAddress);
    expectAddress(tx.from, address);
    expectPopulatedTx(tx, undefined);
    await expectPopulatedTxToRun(tx, wrap.core.rpcProvider);
  });

  testSpending('wrap steth simulate', async () => {
    const wstethAddress = await wrap.core.getContractAddress(
      LIDO_CONTRACT_NAMES.wsteth,
    );
    const tx = await wrap.wrapStethSimulateTx({ value });
    expectAddress(tx.address, wstethAddress);
  });

  testSpending('wrap steth', async () => {
    wstethValue = await wrap.convertStethToWsteth(value);
    const stethBalanceBefore = await steth.balance(address);
    const wstethBalanceBefore = await wsteth.balance(address);
    const mock = jest.fn();
    const tx = await wrap.wrapSteth({ value, callback: mock });
    expectTxCallback(mock, tx);
    const stethBalanceAfter = await steth.balance(address);
    const wstethBalanceAfter = await wsteth.balance(address);

    expectAlmostEqualBn(stethBalanceAfter - stethBalanceBefore, -value);
    expectAlmostEqualBn(wstethBalanceAfter - wstethBalanceBefore, wstethValue);

    await expect(wrap.getStethForWrapAllowance(address)).resolves.toEqual(0n);
  });

  testSpending('unwrap steth populate', async () => {
    const wstethAddress = await wrap.core.getContractAddress(
      LIDO_CONTRACT_NAMES.wsteth,
    );
    const tx = await wrap.unwrapPopulateTx({ value });
    expectAddress(tx.to, wstethAddress);
    expectAddress(tx.from, address);
    expectPopulatedTx(tx, undefined);
    await expectPopulatedTxToRun(tx, wrap.core.rpcProvider);
  });

  testSpending('unwrap steth simulate', async () => {
    const wstethAddress = await wrap.core.getContractAddress(
      LIDO_CONTRACT_NAMES.wsteth,
    );
    const tx = await wrap.unwrapSimulateTx({ value });
    expectAddress(tx.address, wstethAddress);
  });

  testSpending('unwrap steth', async () => {
    const stethBalanceBefore = await steth.balance(address);
    const wstethBalanceBefore = await wsteth.balance(address);
    const mock = jest.fn();
    const tx = await wrap.unwrap({ value: wstethValue, callback: mock });
    expectTxCallback(mock, tx);
    const stethBalanceAfter = await steth.balance(address);
    const wstethBalanceAfter = await wsteth.balance(address);

    expectAlmostEqualBn(stethBalanceAfter - stethBalanceBefore, value);
    expectAlmostEqualBn(wstethBalanceAfter - wstethBalanceBefore, -wstethValue);
  });
});

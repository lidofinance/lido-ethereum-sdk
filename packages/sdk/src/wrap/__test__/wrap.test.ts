import { expect, describe, test } from '@jest/globals';
import { LidoSDKWrap } from '../wrap.js';
import { LIDO_CONTRACT_NAMES, LidoSDKstETH } from '../../index.js';

import { useWrap } from '../../../tests/utils/fixtures/use-wrap.js';
import { expectAddress } from '../../../tests/utils/expect/expect-address.js';
import { expectContract } from '../../../tests/utils/expect/expect-contract.js';
import { useAccount } from '../../../tests/utils/fixtures/use-wallet-client.js';
import {
  expectPopulatedTx,
  expectPopulatedTxToRun,
} from '../../../tests/utils/expect/expect-populated-tx.js';
import {
  expectAlmostEqualBn,
  expectNonNegativeBn,
  expectPositiveBn,
} from '../../../tests/utils/expect/expect-bn.js';
import { expectSDKModule } from '../../../tests/utils/expect/expect-sdk-module.js';

describe('LidoSDKWrap constructor', () => {
  test('is correct module', () => {
    expectSDKModule(LidoSDKWrap);
  });
});

describe('LidoSDKWrap read methods', () => {
  const wrap = useWrap();
  const steth = new LidoSDKstETH({ core: wrap.core });
  const { address } = useAccount();
  const value = 100n;

  test('has correct address', async () => {
    const address = await wrap.contractAddressWstETH();
    const wstethAddress = await wrap.core.getContractAddress(
      LIDO_CONTRACT_NAMES.wsteth,
    );
    expectAddress(address, wstethAddress);
  });

  test('has contract', async () => {
    const wstethAddress = await wrap.core.getContractAddress(
      LIDO_CONTRACT_NAMES.wsteth,
    );
    const contract = await wrap.getContractWstETH();
    expectContract(contract);
    expectAddress(contract.address, wstethAddress);
  });

  test('convert back and forth to steth', async () => {
    const amount = 100000000n;
    const amountWsteth = await wrap.convertStethToWsteth(amount);
    expect(amountWsteth).toBeLessThan(amount);
    const backConversion = await wrap.convertWstethToSteth(amountWsteth);
    expectAlmostEqualBn(amount, backConversion, 2n);
  });

  test('get allowance', async () => {
    const allowance = await wrap.getStethForWrapAllowance(address);
    expectNonNegativeBn(allowance);

    const wstethAddress = await wrap.core.getContractAddress(
      LIDO_CONTRACT_NAMES.wsteth,
    );
    const altAllowance = await steth.allowance({
      account: address,
      to: wstethAddress,
    });
    expect(allowance).toEqual(altAllowance);
  });

  test('approve populate', async () => {
    const stethAddress = await wrap.core.getContractAddress(
      LIDO_CONTRACT_NAMES.lido,
    );
    const tx = await wrap.approveStethForWrapPopulateTx({ value });
    expectAddress(tx.to, stethAddress);
    expectAddress(tx.from, address);
    expectPopulatedTx(tx);
    await expectPopulatedTxToRun(tx, wrap.core.rpcProvider);
  });

  test('approve simulate', async () => {
    const stethAddress = await wrap.core.getContractAddress(
      LIDO_CONTRACT_NAMES.lido,
    );
    const tx = await wrap.approveStethForWrapSimulateTx({ value });
    expectAddress(tx.address, stethAddress);
    expectAddress(tx.functionName, 'approve');
  });

  test('wrapEth populate', async () => {
    const wstethAddress = await wrap.core.getContractAddress(
      LIDO_CONTRACT_NAMES.wsteth,
    );
    const tx = await wrap.wrapEthPopulateTx({ value });
    expectAddress(tx.to, wstethAddress);
    expectAddress(tx.from, address);
    expectPopulatedTx(tx, value, false);
  });

  test('wrapEth estimate', async () => {
    const gas = await wrap.wrapEthEstimateGas({ value });
    expectPositiveBn(gas);
  });
});

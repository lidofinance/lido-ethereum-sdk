import { expect, describe, test } from '@jest/globals';
import { LidoSDKStake } from '../stake.js';
import { expectAddress } from '../../../tests/utils/expect/expect-address.js';
import { expectContract } from '../../../tests/utils/expect/expect-contract.js';
import {
  expectPopulatedTx,
  expectPopulatedTxToRun,
} from '../../../tests/utils/expect/expect-populated-tx.js';
import { useStake } from '../../../tests/utils/fixtures/use-stake.js';
import { expectSDKModule } from '../../../tests/utils/expect/expect-sdk-module.js';

describe('LidoSDKStake constructor', () => {
  test('is correct module', () => {
    expectSDKModule(LidoSDKStake);
  });
});

describe('LidoSDKStake read methods', () => {
  const stake = useStake();

  test('has contract address', async () => {
    expectAddress(await stake.contractAddressStETH());
  });

  test('has contract', async () => {
    expectContract(await stake.getContractStETH());
  });

  test('stake limit info', async () => {
    await expect(stake.getStakeLimitInfo()).resolves.toBeDefined();
  });

  test('stakeEthPopulateTx', async () => {
    const tx = await stake.stakeEthPopulateTx({ value: 100n });
    expectPopulatedTx(tx, 100n);
    await expectPopulatedTxToRun(tx, stake.core.rpcProvider);
  });

  test('stakeEthSimulateTx', async () => {
    const simulationResult = await stake.stakeEthSimulateTx({ value: 100n });
    expect(simulationResult).toBeDefined();
  });
});

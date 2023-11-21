import { describe, expect, test } from '@jest/globals';
import { LidoSDKShares } from '../shares.js';
import { expectSDKModule } from '../../../tests/utils/expect/expect-sdk-module.js';
import { useShares } from '../../../tests/utils/fixtures/use-shares.js';
import {
  useAccount,
  useAltAccount,
} from '../../../tests/utils/fixtures/use-wallet-client.js';
import {
  expectAlmostEqualBn,
  expectNonNegativeBn,
  expectPositiveBn,
} from '../../../tests/utils/expect/expect-bn.js';
import { useSteth } from '../../../tests/utils/fixtures/use-steth.js';
import { expectContract } from '../../../tests/utils/expect/expect-contract.js';
import { LIDO_CONTRACT_NAMES } from '../../index.js';
import { expectAddress } from '../../../tests/utils/expect/expect-address.js';
import { useWrap } from '../../../tests/utils/fixtures/use-wrap.js';
import {
  expectPopulatedTx,
  expectPopulatedTxToRun,
} from '../../../tests/utils/expect/expect-populated-tx.js';

describe('LidoSDKShares', () => {
  const shares = useShares();
  const steth = useSteth();
  const wrap = useWrap();
  const { address } = useAccount();
  const { address: altAddress } = useAltAccount();

  test('is correct module', () => {
    expectSDKModule(LidoSDKShares);
  });

  test('has contact', async () => {
    expectContract(await shares.getContractStETHshares());
  });

  test('has address', async () => {
    const contractAddress = await shares.contractAddressStETH();
    const contract = await shares.getContractStETHshares();
    const contractAddressLocator = await shares.core.getContractAddress(
      LIDO_CONTRACT_NAMES.lido,
    );
    expectAddress(contract.address, contractAddressLocator);
    expectAddress(contractAddress, contractAddressLocator);
  });

  test('has balance', async () => {
    const balanceShares = await shares.balance(address);
    expectNonNegativeBn(balanceShares);
    const balanceSteth = await steth.balance(address);
    if (balanceSteth > 0n) expectPositiveBn(balanceShares);
  });

  test('has share rate', async () => {
    const shareRate = await shares.getShareRate();
    expect(shareRate > 1).toBe(true);

    const value = 100000n;
    const wstethValue = await wrap.convertStethToWsteth(value);
    const shareRateValue = BigInt(Math.floor(Number(value) / shareRate));
    expectAlmostEqualBn(wstethValue, shareRateValue);
  });

  test('has total supply', async () => {
    const { totalEther, totalShares } = await shares.getTotalSupply();
    expectPositiveBn(totalEther);
    expectPositiveBn(totalShares);
    expect(totalEther > totalShares).toBe(true);
  });

  test('converts correctly', async () => {
    const value = 1000000n;
    const sharesValue = await shares.convertToShares(value);
    const wstethValue = await wrap.convertStethToWsteth(value);
    expect(sharesValue).toEqual(wstethValue);

    const stethValue = await shares.convertToSteth(value);
    const altStethValue = await wrap.convertWstethToSteth(value);
    expect(stethValue).toEqual(altStethValue);
  });

  test('populate transfer', async () => {
    const tx = await shares.populateTransfer({ to: altAddress, amount: 100n });
    expectPopulatedTx(tx, undefined, true);
    await expectPopulatedTxToRun(tx, shares.core.rpcProvider);
  });

  test('simulate transfer', async () => {
    const contractAddressSteth = await shares.core.getContractAddress(
      LIDO_CONTRACT_NAMES.lido,
    );
    const tx = await shares.simulateTransfer({ to: altAddress, amount: 100n });
    expectAddress(tx.request.address, contractAddressSteth);
    expectAddress(tx.request.functionName, 'transferShares');
  });
});

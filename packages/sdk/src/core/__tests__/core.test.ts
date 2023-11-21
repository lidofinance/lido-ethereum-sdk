/* eslint-disable jest/expect-expect */
import { test, expect, describe } from '@jest/globals';

import { LidoSDKCore } from '../index.js';
import { useTestsEnvs } from '../../../tests/utils/fixtures/use-test-envs.js';
import { expectSDKError } from '../../../tests/utils/expect/expect-sdk-error.js';
import { ERROR_CODE, LIDO_CONTRACT_NAMES } from '../../index.js';
import { useRpcCore } from '../../../tests/utils/fixtures/use-core.js';
import { useWalletClient } from '../../../tests/utils/fixtures/use-wallet-client.js';
import { expectAddress } from '../../../tests/utils/expect/expect-address.js';
import { expectContract } from '../../../tests/utils/expect/expect-contract.js';
import { expectPositiveBn } from '../../../tests/utils/expect/expect-bn.js';

describe('Core Tests', () => {
  const { rpcUrl, chainId } = useTestsEnvs();
  const { account } = useWalletClient();
  const rpcCore = useRpcCore();

  test('Core can be created', () => {
    const core = new LidoSDKCore({
      chainId: chainId,
      rpcUrls: [rpcUrl],
      logMode: 'none',
    });
    expect(core).toBeDefined();
    expect(core.chainId).toBe(chainId);
    expect(core.rpcProvider).toBeDefined();
    expect(core.web3Provider).toBeUndefined();
  });

  test('Core accepts only valid arguments', () => {
    void expectSDKError(
      () =>
        new LidoSDKCore({
          chainId: chainId,
          rpcUrls: [],
        }),
      ERROR_CODE.INVALID_ARGUMENT,
    );

    void expectSDKError(
      () =>
        new LidoSDKCore({
          chainId: 100 as any,
          rpcUrls: [rpcUrl],
        }),
      ERROR_CODE.INVALID_ARGUMENT,
    );
  });

  test('web3 provider is immutable', () => {
    expect(() => ((rpcCore as any).web3Provider = {})).toThrow();
  });

  test('web3 functions are not available', async () => {
    expect(rpcCore.web3Provider).toBeUndefined();
    await expectSDKError(
      () => rpcCore.useWeb3Provider(),
      ERROR_CODE.PROVIDER_ERROR,
    );
    await expectSDKError(
      () => rpcCore.getWeb3Address(),
      ERROR_CODE.PROVIDER_ERROR,
    );
    await expectSDKError(
      () =>
        rpcCore.performTransaction({
          account: '0x0',
          callback: () => {},
          getGasLimit: () => Promise.resolve(0n),
          sendTransaction: () => Promise.resolve({} as any),
        }),
      ERROR_CODE.PROVIDER_ERROR,
    );
    await expectSDKError(
      () =>
        rpcCore.signPermit({
          account: '0x0',
          amount: 1n,
          spender: '0x0',
          token: 'stETH',
        }),
      ERROR_CODE.PROVIDER_ERROR,
    );
  });

  test('balanceETH', async () => {
    const balance = await rpcCore.balanceETH(account.address);
    expect(typeof balance).toEqual('bigint');
    expect(balance).toBeGreaterThanOrEqual(0n);
  });

  test('contractAddressLidoLocator', async () => {
    expectAddress(rpcCore.contractAddressLidoLocator());
  });

  test('getContractLidoLocator', async () => {
    const locator = rpcCore.getContractLidoLocator();
    expectContract(locator);
  });

  test('getFeeData', async () => {
    const { gasPrice, lastBaseFeePerGas, maxFeePerGas, maxPriorityFeePerGas } =
      await rpcCore.getFeeData();
    expectPositiveBn(gasPrice);
    expectPositiveBn(lastBaseFeePerGas);
    expectPositiveBn(maxFeePerGas);
    expectPositiveBn(maxPriorityFeePerGas);
  });

  test('isContract', async () => {
    const locatorAddress = rpcCore.contractAddressLidoLocator();
    await expect(rpcCore.isContract(locatorAddress)).resolves.toBe(true);
    await expect(rpcCore.isContract(account.address)).resolves.toBe(false);
  });

  test('getContractAddress', async () => {
    const lido = rpcCore.getContractAddress(LIDO_CONTRACT_NAMES.lido);
    expectAddress(lido);
    const wsteth = rpcCore.getContractAddress(LIDO_CONTRACT_NAMES.wsteth);
    expectAddress(wsteth);
  });

  test('toBlockNumber', async () => {
    const block = await rpcCore.rpcProvider.getBlock({ blockTag: 'latest' });
    await expect(rpcCore.toBlockNumber({ block: block.number })).resolves.toBe(
      block.number,
    );
    await expect(
      rpcCore.toBlockNumber({ timestamp: block.timestamp }),
    ).resolves.toBe(block.number);
  });

  // toBackBlock
});

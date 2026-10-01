import { test, expect, describe } from 'vitest';
import { createPublicClient, defineChain, http, type Chain } from 'viem';

import { LidoSDKCore } from '../index.js';
import { CHAINS, ERROR_CODE, VIEM_CHAINS } from '../../index.js';
import { useTestsEnvs } from '../../../tests/utils/fixtures/use-test-envs.js';
import { usePublicRpcProvider } from '../../../tests/utils/fixtures/use-test-rpc-provider.js';
import { expectSDKError } from '../../../tests/utils/expect/expect-sdk-error.js';
import { expectAddress } from '../../../tests/utils/expect/expect-address.js';

const CUSTOM_CHAIN_ID = 999_999;
const CUSTOM_LOCATOR = '0x0000000000000000000000000000000000000001';

describe('Core custom supported chains', () => {
  const { chainId, rpcUrl } = useTestsEnvs();
  const builtInChain = VIEM_CHAINS[chainId as CHAINS];

  // same id as the test chain but a different definition
  const overriddenChain: Chain = defineChain({
    ...builtInChain,
    name: 'Custom Test Chain',
  });

  // chain id that is not in SUPPORTED_CHAINS
  const devnetChain: Chain = defineChain({
    ...builtInChain,
    id: CUSTOM_CHAIN_ID,
    name: 'Custom Devnet',
  });

  test('core without customSupportedChains uses built-in chain', () => {
    const core = new LidoSDKCore({
      chainId,
      publicClient: usePublicRpcProvider(),
      logMode: 'none',
    });
    expect(core.chainId).toBe(chainId);
    expect(core.chain).toBe(builtInChain);
  });

  test('custom chain overrides built-in chain with matching id', () => {
    const core = new LidoSDKCore({
      chainId,
      publicClient: usePublicRpcProvider(),
      logMode: 'none',
      customSupportedChains: [overriddenChain],
    });
    expect(core.chainId).toBe(chainId);
    expect(core.chain).toBe(overriddenChain);
    expect(core.chain.name).toBe('Custom Test Chain');
  });

  test('custom chain is used for publicClient created from rpcUrls', () => {
    const core = new LidoSDKCore({
      chainId,
      rpcUrls: [rpcUrl],
      logMode: 'none',
      customSupportedChains: [overriddenChain],
    });
    expect(core.chain).toBe(overriddenChain);
    expect(core.publicClient.chain).toBe(overriddenChain);
  });

  test('custom chains with non-matching id are ignored', () => {
    const core = new LidoSDKCore({
      chainId,
      publicClient: usePublicRpcProvider(),
      logMode: 'none',
      customSupportedChains: [devnetChain],
    });
    expect(core.chainId).toBe(chainId);
    expect(core.chain).toBe(builtInChain);
  });

  test('chain id outside SUPPORTED_CHAINS is accepted when custom chain is provided', () => {
    const core = new LidoSDKCore({
      chainId: CUSTOM_CHAIN_ID,
      rpcUrls: [rpcUrl],
      logMode: 'none',
      customSupportedChains: [devnetChain],
    });
    expect(core.chainId).toBe(CUSTOM_CHAIN_ID);
    expect(core.chain).toBe(devnetChain);
    expect(core.publicClient.chain?.id).toBe(CUSTOM_CHAIN_ID);
  });

  test('chain id is inferred from publicClient with custom chain', () => {
    const publicClient = createPublicClient({
      chain: devnetChain,
      transport: http(rpcUrl),
    });
    const core = new LidoSDKCore({
      publicClient,
      logMode: 'none',
      customSupportedChains: [devnetChain],
    });
    expect(core.chainId).toBe(CUSTOM_CHAIN_ID);
    expect(core.chain).toBe(devnetChain);
  });

  test('custom chain without lido contracts throws NOT_SUPPORTED on locator access', async () => {
    const core = new LidoSDKCore({
      chainId: CUSTOM_CHAIN_ID,
      rpcUrls: [rpcUrl],
      logMode: 'none',
      customSupportedChains: [devnetChain],
    });
    await expectSDKError(
      () => core.contractAddressLidoLocator(),
      ERROR_CODE.NOT_SUPPORTED,
    );
  });

  test('custom chain works with customLidoLocatorAddress', () => {
    const core = new LidoSDKCore({
      chainId: CUSTOM_CHAIN_ID,
      rpcUrls: [rpcUrl],
      logMode: 'none',
      customSupportedChains: [devnetChain],
      customLidoLocatorAddress: CUSTOM_LOCATOR,
    });
    const locator = core.contractAddressLidoLocator();
    expectAddress(locator);
    expect(locator).toBe(CUSTOM_LOCATOR);
  });

  test('chain id outside SUPPORTED_CHAINS is rejected without custom chain', async () => {
    await expectSDKError(
      () =>
        new LidoSDKCore({
          chainId: CUSTOM_CHAIN_ID,
          rpcUrls: [rpcUrl],
          logMode: 'none',
        }),
      ERROR_CODE.INVALID_ARGUMENT,
    );

    await expectSDKError(
      () =>
        new LidoSDKCore({
          chainId: CUSTOM_CHAIN_ID,
          rpcUrls: [rpcUrl],
          logMode: 'none',
          customSupportedChains: [overriddenChain],
        }),
      ERROR_CODE.INVALID_ARGUMENT,
    );
  });

  test('empty customSupportedChains is rejected', async () => {
    await expectSDKError(
      () =>
        new LidoSDKCore({
          chainId,
          publicClient: usePublicRpcProvider(),
          logMode: 'none',
          customSupportedChains: [],
        }),
      ERROR_CODE.INVALID_ARGUMENT,
    );
  });

  test('malformed customSupportedChains is rejected', async () => {
    await expectSDKError(
      () =>
        new LidoSDKCore({
          chainId,
          publicClient: usePublicRpcProvider(),
          logMode: 'none',
          customSupportedChains: [{ name: 'no id' } as any],
        }),
      ERROR_CODE.INVALID_ARGUMENT,
    );
  });

  test('publicClient chain id must match custom chain id', async () => {
    await expectSDKError(
      () =>
        new LidoSDKCore({
          chainId: CUSTOM_CHAIN_ID,
          publicClient: usePublicRpcProvider(),
          logMode: 'none',
          customSupportedChains: [devnetChain],
        }),
      ERROR_CODE.INVALID_ARGUMENT,
    );
  });
});

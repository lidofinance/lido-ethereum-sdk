import { test, expect, describe, beforeAll } from 'vitest';
import type { Address } from 'viem';

import { LidoSDKCore } from '../index.js';
import {
  ERROR_CODE,
  LIDO_CONTRACT_NAMES,
  LidoSDKVaultModule,
} from '../../index.js';
import { useTestsEnvs } from '../../../tests/utils/fixtures/use-test-envs.js';
import { usePublicRpcProvider } from '../../../tests/utils/fixtures/use-test-rpc-provider.js';
import { useRpcCore } from '../../../tests/utils/fixtures/use-core.js';
import { expectSDKError } from '../../../tests/utils/expect/expect-sdk-error.js';
import { expectAddress } from '../../../tests/utils/expect/expect-address.js';

const WRONG_ADDRESS: Address = '0x0000000000000000000000000000000000000001';

describe('Core stvault contract address pinning', () => {
  const { chainId } = useTestsEnvs();
  const rpcCore = useRpcCore();

  const createCoreWithManifest = (
    contractAddressManifest: LidoSDKCore['contractAddressManifest'],
  ) =>
    new LidoSDKCore({
      chainId,
      publicClient: usePublicRpcProvider(),
      logMode: 'none',
      contractAddressManifest,
    });

  // real addresses resolved by a manifest-less core
  let vaultHubAddress: Address;
  let vaultViewerAddress: Address;

  beforeAll(async () => {
    vaultHubAddress = await rpcCore.getContractAddress(
      LIDO_CONTRACT_NAMES.vaultHub,
    );
    vaultViewerAddress = rpcCore.getVaultViewerAddress();
    expectAddress(vaultHubAddress);
    expectAddress(vaultViewerAddress);
  });

  test('resolves a locator-based stvault contract', async () => {
    await expect(
      rpcCore.getContractAddress(LIDO_CONTRACT_NAMES.vaultHub),
    ).resolves.toBe(vaultHubAddress);
  });

  test('resolves the vaultViewer constant', async () => {
    await expect(
      rpcCore.getContractAddress(LIDO_CONTRACT_NAMES.vaultViewer),
    ).resolves.toBe(vaultViewerAddress);
  });

  test('matching manifest passes for locator-based stvault contract', async () => {
    const core = createCoreWithManifest({
      [LIDO_CONTRACT_NAMES.vaultHub]: vaultHubAddress,
    });
    await expect(
      core.getContractAddress(LIDO_CONTRACT_NAMES.vaultHub),
    ).resolves.toBe(vaultHubAddress);
  });

  test('matching manifest passes for vaultViewer constant', async () => {
    const core = createCoreWithManifest({
      [LIDO_CONTRACT_NAMES.vaultViewer]: vaultViewerAddress,
    });
    await expect(
      core.getContractAddress(LIDO_CONTRACT_NAMES.vaultViewer),
    ).resolves.toBe(vaultViewerAddress);
  });

  test('mismatching stvault address throws PROVIDER_ERROR', async () => {
    const core = createCoreWithManifest({
      [LIDO_CONTRACT_NAMES.vaultHub]: WRONG_ADDRESS,
    });
    await expectSDKError(
      () => core.getContractAddress(LIDO_CONTRACT_NAMES.vaultHub),
      ERROR_CODE.PROVIDER_ERROR,
    );
  });

  test('mismatching vaultViewer address throws PROVIDER_ERROR', async () => {
    const core = createCoreWithManifest({
      [LIDO_CONTRACT_NAMES.vaultViewer]: WRONG_ADDRESS,
    });
    await expectSDKError(
      () => core.getContractAddress(LIDO_CONTRACT_NAMES.vaultViewer),
      ERROR_CODE.PROVIDER_ERROR,
    );
  });

  test('stvault address comparison is case-insensitive', async () => {
    const core = createCoreWithManifest({
      [LIDO_CONTRACT_NAMES.vaultHub]: vaultHubAddress.toLowerCase() as Address,
    });
    await expect(
      core.getContractAddress(LIDO_CONTRACT_NAMES.vaultHub),
    ).resolves.toBe(vaultHubAddress);
  });

  test('contracts absent from manifest are not verified', async () => {
    const core = createCoreWithManifest({
      [LIDO_CONTRACT_NAMES.vaultHub]: WRONG_ADDRESS,
    });
    await expect(
      core.getContractAddress(LIDO_CONTRACT_NAMES.vaultViewer),
    ).resolves.toBe(vaultViewerAddress);
  });

  test('vault contract getters route through the manifest', async () => {
    const core = new LidoSDKCore({
      chainId,
      publicClient: usePublicRpcProvider(),
      logMode: 'none',
      contractAddressManifest: {
        [LIDO_CONTRACT_NAMES.vaultHub]: WRONG_ADDRESS,
      },
    });
    const vaultModule = new LidoSDKVaultModule({ core });
    await expectSDKError(
      () => vaultModule.contracts.getContractVaultHub(),
      ERROR_CODE.PROVIDER_ERROR,
    );
  });

  test('vault contract getters resolve matching address', async () => {
    const core = new LidoSDKCore({
      chainId,
      publicClient: usePublicRpcProvider(),
      logMode: 'none',
      contractAddressManifest: {
        [LIDO_CONTRACT_NAMES.vaultHub]: vaultHubAddress,
      },
    });
    const vaultModule = new LidoSDKVaultModule({ core });
    const hub = await vaultModule.contracts.getContractVaultHub();
    expectAddress(hub.address, vaultHubAddress);
  });
});

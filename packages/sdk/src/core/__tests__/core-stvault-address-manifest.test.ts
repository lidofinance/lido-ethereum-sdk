import { test, expect, describe, beforeAll } from 'vitest';
import type { Address } from 'viem';

import { LidoSDKCore } from '../index.js';
import {
  ERROR_CODE,
  LidoSDKVaultModule,
  STVAULT_CONTRACT_NAMES,
} from '../../index.js';
import { useTestsEnvs } from '../../../tests/utils/fixtures/use-test-envs.js';
import { usePublicRpcProvider } from '../../../tests/utils/fixtures/use-test-rpc-provider.js';
import { useRpcCore } from '../../../tests/utils/fixtures/use-core.js';
import { expectSDKError } from '../../../tests/utils/expect/expect-sdk-error.js';
import { expectAddress } from '../../../tests/utils/expect/expect-address.js';

const WRONG_ADDRESS: Address = '0x0000000000000000000000000000000000000001';

describe('Core stvault contract address manifest', () => {
  const { chainId } = useTestsEnvs();
  const rpcCore = useRpcCore();

  const createCoreWithStVaultManifest = (
    stVaultContractAddressManifest: LidoSDKCore['stVaultContractAddressManifest'],
  ) =>
    new LidoSDKCore({
      chainId,
      publicClient: usePublicRpcProvider(),
      logMode: 'none',
      stVaultContractAddressManifest,
    });

  // real addresses resolved by a manifest-less core
  let vaultHubAddress: Address;
  let vaultViewerAddress: Address;

  beforeAll(async () => {
    vaultHubAddress = await rpcCore.getStVaultContractAddress(
      STVAULT_CONTRACT_NAMES.vaultHub,
    );
    vaultViewerAddress = rpcCore.getVaultViewerAddress();
    expectAddress(vaultHubAddress);
    expectAddress(vaultViewerAddress);
  });

  test('stvault manifest is stored on core', () => {
    const manifest = { [STVAULT_CONTRACT_NAMES.vaultHub]: WRONG_ADDRESS };
    const core = createCoreWithStVaultManifest(manifest);
    expect(core.stVaultContractAddressManifest).toEqual(manifest);
  });

  test('core without stvault manifest has no stvault manifest', () => {
    expect(rpcCore.stVaultContractAddressManifest).toBeUndefined();
  });

  test('empty stvault manifest is rejected', async () => {
    await expectSDKError(
      () => createCoreWithStVaultManifest({}),
      ERROR_CODE.INVALID_ARGUMENT,
    );
  });

  test('undefined address is rejected with INVALID_ARGUMENT', async () => {
    const manifest = {
      [STVAULT_CONTRACT_NAMES.vaultHub]: undefined,
    } as LidoSDKCore['stVaultContractAddressManifest'];
    await expectSDKError(
      () => createCoreWithStVaultManifest(manifest),
      ERROR_CODE.INVALID_ARGUMENT,
    );
  });

  test('getStVaultContractAddress passes for matching locator contract', async () => {
    const core = createCoreWithStVaultManifest({
      [STVAULT_CONTRACT_NAMES.vaultHub]: vaultHubAddress,
    });
    await expect(
      core.getStVaultContractAddress(STVAULT_CONTRACT_NAMES.vaultHub),
    ).resolves.toBe(vaultHubAddress);
  });

  test('getStVaultContractAddress passes for matching vaultViewer constant', async () => {
    const core = createCoreWithStVaultManifest({
      [STVAULT_CONTRACT_NAMES.vaultViewer]: vaultViewerAddress,
    });
    await expect(
      core.getStVaultContractAddress(STVAULT_CONTRACT_NAMES.vaultViewer),
    ).resolves.toBe(vaultViewerAddress);
  });

  test('stvault address comparison is case-insensitive', async () => {
    const core = createCoreWithStVaultManifest({
      [STVAULT_CONTRACT_NAMES.vaultHub]:
        vaultHubAddress.toLowerCase() as Address,
    });
    await expect(
      core.getStVaultContractAddress(STVAULT_CONTRACT_NAMES.vaultHub),
    ).resolves.toBe(vaultHubAddress);
  });

  test('getStVaultContractAddress throws on mismatching address', async () => {
    const core = createCoreWithStVaultManifest({
      [STVAULT_CONTRACT_NAMES.vaultHub]: WRONG_ADDRESS,
    });
    await expectSDKError(
      () => core.getStVaultContractAddress(STVAULT_CONTRACT_NAMES.vaultHub),
      ERROR_CODE.PROVIDER_ERROR,
    );
  });

  test('vaultViewer mismatch throws', async () => {
    const core = createCoreWithStVaultManifest({
      [STVAULT_CONTRACT_NAMES.vaultViewer]: WRONG_ADDRESS,
    });
    await expectSDKError(
      () =>
        core.getStVaultContractAddress(STVAULT_CONTRACT_NAMES.vaultViewer),
      ERROR_CODE.PROVIDER_ERROR,
    );
  });

  test('contracts absent from manifest are not verified', async () => {
    const core = createCoreWithStVaultManifest({
      [STVAULT_CONTRACT_NAMES.vaultHub]: WRONG_ADDRESS,
    });
    await expect(
      core.getStVaultContractAddress(STVAULT_CONTRACT_NAMES.vaultViewer),
    ).resolves.toBe(vaultViewerAddress);
  });

  test('vault contract getters route through the manifest', async () => {
    const core = new LidoSDKCore({
      chainId,
      publicClient: usePublicRpcProvider(),
      logMode: 'none',
      stVaultContractAddressManifest: {
        [STVAULT_CONTRACT_NAMES.vaultHub]: WRONG_ADDRESS,
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
      stVaultContractAddressManifest: {
        [STVAULT_CONTRACT_NAMES.vaultHub]: vaultHubAddress,
      },
    });
    const vaultModule = new LidoSDKVaultModule({ core });
    const hub = await vaultModule.contracts.getContractVaultHub();
    expectAddress(hub.address, vaultHubAddress);
  });
});

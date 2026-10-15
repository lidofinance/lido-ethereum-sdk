import { test, expect, describe, beforeAll } from 'vitest';
import type { Address } from 'viem';

import { LidoSDKCore } from '../index.js';
import {
  ERROR_CODE,
  LIDO_CONTRACT_NAMES,
  LidoSDKVaultModule,
} from '../../index.js';
import type { LidoSDKVaultContracts } from '../../index.js';
import { useTestsEnvs } from '../../../tests/utils/fixtures/use-test-envs.js';
import { usePublicRpcProvider } from '../../../tests/utils/fixtures/use-test-rpc-provider.js';
import { useRpcCore } from '../../../tests/utils/fixtures/use-core.js';
import { expectSDKError } from '../../../tests/utils/expect/expect-sdk-error.js';
import { expectAddress } from '../../../tests/utils/expect/expect-address.js';

const WRONG_ADDRESS: Address = '0x0000000000000000000000000000000000000001';

const stVaultContractNames = [
  LIDO_CONTRACT_NAMES.vaultHub,
  LIDO_CONTRACT_NAMES.vaultFactory,
  LIDO_CONTRACT_NAMES.vaultViewer,
  LIDO_CONTRACT_NAMES.lazyOracle,
  LIDO_CONTRACT_NAMES.predepositGuarantee,
  LIDO_CONTRACT_NAMES.operatorGrid,
] as const;

type StVaultContractName = (typeof stVaultContractNames)[number];

const getVaultContract = (
  contracts: LidoSDKVaultContracts,
  name: StVaultContractName,
): Promise<{ address: Address }> => {
  const getters: Record<
    StVaultContractName,
    () => Promise<{ address: Address }>
  > = {
    [LIDO_CONTRACT_NAMES.vaultHub]: () => contracts.getContractVaultHub(),
    [LIDO_CONTRACT_NAMES.vaultFactory]: () =>
      contracts.getContractVaultFactory(),
    [LIDO_CONTRACT_NAMES.vaultViewer]: () =>
      contracts.getContractVaultViewer(),
    [LIDO_CONTRACT_NAMES.lazyOracle]: () => contracts.getContractLazyOracle(),
    [LIDO_CONTRACT_NAMES.predepositGuarantee]: () =>
      contracts.getContractPredepositGuarantee(),
    [LIDO_CONTRACT_NAMES.operatorGrid]: () =>
      contracts.getContractOperatorGrid(),
  };
  return getters[name]();
};

describe('Core stvault contract address pinning', () => {
  const { chainId } = useTestsEnvs();
  const rpcCore = useRpcCore();

  const createCore = () =>
    new LidoSDKCore({
      chainId,
      publicClient: usePublicRpcProvider(),
      logMode: 'none',
    });

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
  const realAddresses = {} as Record<StVaultContractName, Address>;

  beforeAll(async () => {
    for (const name of stVaultContractNames) {
      realAddresses[name] = await rpcCore.getContractAddress(name);
      expectAddress(realAddresses[name]);
    }
  });

  test('resolves a locator-based stvault contract', async () => {
    await expect(
      createCore().getContractAddress(LIDO_CONTRACT_NAMES.vaultHub),
    ).resolves.toBe(realAddresses[LIDO_CONTRACT_NAMES.vaultHub]);
  });

  test('resolves the vaultViewer constant', async () => {
    await expect(
      createCore().getContractAddress(LIDO_CONTRACT_NAMES.vaultViewer),
    ).resolves.toBe(realAddresses[LIDO_CONTRACT_NAMES.vaultViewer]);
  });

  test('matching manifest passes for locator-based stvault contract', async () => {
    const core = createCoreWithManifest({
      [LIDO_CONTRACT_NAMES.vaultHub]:
        realAddresses[LIDO_CONTRACT_NAMES.vaultHub],
    });
    await expect(
      core.getContractAddress(LIDO_CONTRACT_NAMES.vaultHub),
    ).resolves.toBe(realAddresses[LIDO_CONTRACT_NAMES.vaultHub]);
  });

  test('matching manifest passes for vaultViewer constant', async () => {
    const core = createCoreWithManifest({
      [LIDO_CONTRACT_NAMES.vaultViewer]:
        realAddresses[LIDO_CONTRACT_NAMES.vaultViewer],
    });
    await expect(
      core.getContractAddress(LIDO_CONTRACT_NAMES.vaultViewer),
    ).resolves.toBe(realAddresses[LIDO_CONTRACT_NAMES.vaultViewer]);
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
      [LIDO_CONTRACT_NAMES.vaultHub]:
        realAddresses[LIDO_CONTRACT_NAMES.vaultHub].toLowerCase() as Address,
    });
    await expect(
      core.getContractAddress(LIDO_CONTRACT_NAMES.vaultHub),
    ).resolves.toBe(realAddresses[LIDO_CONTRACT_NAMES.vaultHub]);
  });

  test('contracts absent from manifest are not verified', async () => {
    const core = createCoreWithManifest({
      [LIDO_CONTRACT_NAMES.vaultHub]: WRONG_ADDRESS,
    });
    await expect(
      core.getContractAddress(LIDO_CONTRACT_NAMES.vaultViewer),
    ).resolves.toBe(realAddresses[LIDO_CONTRACT_NAMES.vaultViewer]);
  });

  test.each(stVaultContractNames)(
    'vault contract getter routes through the manifest (%s)',
    async (name) => {
      const core = new LidoSDKCore({
        chainId,
        publicClient: usePublicRpcProvider(),
        logMode: 'none',
        contractAddressManifest: {
          [name]: WRONG_ADDRESS,
        } as LidoSDKCore['contractAddressManifest'],
      });
      const vaultModule = new LidoSDKVaultModule({ core });
      await expectSDKError(
        () => getVaultContract(vaultModule.contracts, name),
        ERROR_CODE.PROVIDER_ERROR,
      );
    },
  );

  test.each(stVaultContractNames)(
    'vault contract getter resolves matching address (%s)',
    async (name) => {
      const core = new LidoSDKCore({
        chainId,
        publicClient: usePublicRpcProvider(),
        logMode: 'none',
        contractAddressManifest: {
          [name]: realAddresses[name],
        } as LidoSDKCore['contractAddressManifest'],
      });
      const vaultModule = new LidoSDKVaultModule({ core });
      const contract = await getVaultContract(vaultModule.contracts, name);
      expectAddress(contract.address, realAddresses[name]);
    },
  );
});

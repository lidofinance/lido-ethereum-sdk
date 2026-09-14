import { test, expect, describe, beforeAll } from 'vitest';
import type { Address } from 'viem';

import { LidoSDKCore } from '../index.js';
import { ERROR_CODE, LIDO_CONTRACT_NAMES } from '../../index.js';
import { useTestsEnvs } from '../../../tests/utils/fixtures/use-test-envs.js';
import { usePublicRpcProvider } from '../../../tests/utils/fixtures/use-test-rpc-provider.js';
import { useRpcCore } from '../../../tests/utils/fixtures/use-core.js';
import { expectSDKError } from '../../../tests/utils/expect/expect-sdk-error.js';
import { expectAddress } from '../../../tests/utils/expect/expect-address.js';

const WRONG_ADDRESS: Address = '0x0000000000000000000000000000000000000001';

describe('Core contract address manifest', () => {
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

  // real addresses resolved from the locator by a manifest-less core
  let lidoAddress: Address;
  let wstethAddress: Address;

  beforeAll(async () => {
    lidoAddress = await rpcCore.getContractAddress(LIDO_CONTRACT_NAMES.lido);
    wstethAddress = await rpcCore.getContractAddress(
      LIDO_CONTRACT_NAMES.wsteth,
    );
    expectAddress(lidoAddress);
    expectAddress(wstethAddress);
  });

  test('manifest is stored on core', () => {
    const manifest = { [LIDO_CONTRACT_NAMES.lido]: WRONG_ADDRESS };
    const core = createCoreWithManifest(manifest);
    expect(core.contractAddressManifest).toEqual(manifest);
  });

  test('core without manifest has no manifest', () => {
    expect(rpcCore.contractAddressManifest).toBeUndefined();
  });

  test('empty manifest is rejected', async () => {
    await expectSDKError(
      () => createCoreWithManifest({}),
      ERROR_CODE.INVALID_ARGUMENT,
    );
  });

  test('getContractAddress passes verification for matching address', async () => {
    const core = createCoreWithManifest({
      [LIDO_CONTRACT_NAMES.lido]: lidoAddress,
      [LIDO_CONTRACT_NAMES.wsteth]: wstethAddress,
    });
    await expect(
      core.getContractAddress(LIDO_CONTRACT_NAMES.lido),
    ).resolves.toBe(lidoAddress);
    await expect(
      core.getContractAddress(LIDO_CONTRACT_NAMES.wsteth),
    ).resolves.toBe(wstethAddress);
  });

  test('address comparison is case-insensitive', async () => {
    const core = createCoreWithManifest({
      [LIDO_CONTRACT_NAMES.lido]: lidoAddress.toLowerCase() as Address,
    });
    await expect(
      core.getContractAddress(LIDO_CONTRACT_NAMES.lido),
    ).resolves.toBe(lidoAddress);
  });

  test('getContractAddress throws on mismatching address', async () => {
    const core = createCoreWithManifest({
      [LIDO_CONTRACT_NAMES.lido]: WRONG_ADDRESS,
    });
    await expectSDKError(
      () => core.getContractAddress(LIDO_CONTRACT_NAMES.lido),
      ERROR_CODE.PROVIDER_ERROR,
    );
  });

  test('contracts absent from manifest are not verified', async () => {
    const core = createCoreWithManifest({
      [LIDO_CONTRACT_NAMES.lido]: WRONG_ADDRESS,
    });
    await expect(
      core.getContractAddress(LIDO_CONTRACT_NAMES.wsteth),
    ).resolves.toBe(wstethAddress);
  });
});

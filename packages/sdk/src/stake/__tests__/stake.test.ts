import { expect, describe, test } from '@jest/globals';
import { LidoSDKStake } from '../stake.js';
import { LidoSDKCore } from '../../index.js';
import { useRpcCore } from '../../../tests/utils/use-core.js';
import { useTestsEnvs } from '../../../tests/utils/use-test-envs.js';
import { expectAddress } from '../../../tests/utils/expect-address.js';
import { expectContract } from '../../../tests/utils/expect-contract.js';

const useStake = () => {
  const rpcCore = useRpcCore();
  const stake = new LidoSDKStake({ core: rpcCore });
  return stake;
};

describe('LidoSDKStake constructor', () => {
  test('can be constructed with core', () => {
    const rpcCore = useRpcCore();
    const stake = new LidoSDKStake({ core: rpcCore });
    expect(stake).toBeInstanceOf(LidoSDKStake);
    expect(stake.core).toBeInstanceOf(LidoSDKCore);
  });

  test('can be constructed with rpc', () => {
    const { rpcUrl, chainId } = useTestsEnvs();
    const stake = new LidoSDKStake({
      chainId,
      rpcUrls: [rpcUrl],
      logMode: 'none',
    });
    expect(stake).toBeInstanceOf(LidoSDKStake);
    expect(stake.core).toBeInstanceOf(LidoSDKCore);
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
});

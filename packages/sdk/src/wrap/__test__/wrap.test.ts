import { expect, describe, test } from '@jest/globals';
import { LidoSDKWrap } from '../wrap.js';
import { LidoSDKCore } from '../../index.js';
import { useRpcCore } from '../../../tests/utils/fixtures/use-core.js';
import { useTestsEnvs } from '../../../tests/utils/fixtures/use-test-envs.js';

describe('LidoSDKWrap constructor', () => {
  test('can be constructed with core', () => {
    const rpcCore = useRpcCore();
    const stake = new LidoSDKWrap({ core: rpcCore });
    expect(stake).toBeInstanceOf(LidoSDKWrap);
    expect(stake.core).toBeInstanceOf(LidoSDKCore);
  });

  test('can be constructed with rpc', () => {
    const { rpcUrl, chainId } = useTestsEnvs();
    const stake = new LidoSDKWrap({
      chainId,
      rpcUrls: [rpcUrl],
      logMode: 'none',
    });
    expect(stake).toBeInstanceOf(LidoSDKWrap);
    expect(stake.core).toBeInstanceOf(LidoSDKCore);
  });
});

describe('LidoSDKWrap read methods', () => {
  test('can be constructed with core', () => {
    const rpcCore = useRpcCore();
    const stake = new LidoSDKWrap({ core: rpcCore });
    expect(stake).toBeInstanceOf(LidoSDKWrap);
    expect(stake.core).toBeInstanceOf(LidoSDKCore);
  });

  test('can be constructed with rpc', () => {
    const { rpcUrl, chainId } = useTestsEnvs();
    const stake = new LidoSDKWrap({
      chainId,
      rpcUrls: [rpcUrl],
      logMode: 'none',
    });
    expect(stake).toBeInstanceOf(LidoSDKWrap);
    expect(stake.core).toBeInstanceOf(LidoSDKCore);
  });
});

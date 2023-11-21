import { expect } from '@jest/globals';
import { LidoSDKModule } from '../../../src/common/class-primitives/sdk-module.js';
import { LidoSDKCommonProps } from '../../../src/core/types.js';
import { LidoSDKCore } from '../../../src/index.js';
import { useRpcCore } from '../fixtures/use-core.js';
import { useTestsEnvs } from '../fixtures/use-test-envs.js';
import { LidoSDKCacheable } from '../../../src/common/class-primitives/cacheable.js';

export const expectSDKModule = (
  ModulePrototype: new (props: LidoSDKCommonProps) => LidoSDKModule,
) => {
  const rpcCore = useRpcCore();
  const instance = new ModulePrototype({ core: rpcCore });
  expect(instance).toBeInstanceOf(LidoSDKModule);
  expect(instance).toBeInstanceOf(LidoSDKCacheable);
  expect(instance.core).toBeInstanceOf(LidoSDKCore);

  const { rpcUrl, chainId } = useTestsEnvs();
  const altInstance = new ModulePrototype({
    chainId,
    rpcUrls: [rpcUrl],
    logMode: 'none',
  });
  expect(altInstance).toBeInstanceOf(LidoSDKModule);
  expect(altInstance).toBeInstanceOf(LidoSDKCacheable);
  expect(altInstance.core).toBeInstanceOf(LidoSDKCore);
};

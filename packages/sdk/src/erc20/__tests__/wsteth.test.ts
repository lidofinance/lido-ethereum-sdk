import { describe } from '@jest/globals';
import { LidoSDKwstETH } from '../wsteth.js';
import {
  useRpcCore,
  useWeb3Core,
} from '../../../tests/utils/fixtures/use-core.js';
import { useTestsEnvs } from '../../../tests/utils/fixtures/use-test-envs.js';
import { testERC20 } from './erc20-abstract.js';
import { LIDO_CONTRACT_NAMES } from '../../index.js';

describe('LidoSDKStake', () => {
  const rpcCore = useRpcCore();
  const web3Core = useWeb3Core();
  const { rpcUrl, chainId } = useTestsEnvs();

  const constructedWithRpcCore = new LidoSDKwstETH({ core: rpcCore });
  const constructedWithWeb3Core = new LidoSDKwstETH({ core: web3Core });
  const constructedWithRpc = new LidoSDKwstETH({
    chainId,
    rpcUrls: [rpcUrl],
    logMode: 'none',
  });

  testERC20({
    contractName: LIDO_CONTRACT_NAMES.wsteth,
    constructedWithRpcCore,
    constructedWithWeb3Core,
    constructedWithRpc,
  });
});

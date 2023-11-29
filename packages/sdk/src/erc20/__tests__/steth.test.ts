import { describe } from '@jest/globals';
import { LidoSDKstETH } from '../steth.js';
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

  const constructedWithRpcCore = new LidoSDKstETH({ core: rpcCore });
  const constructedWithWeb3Core = new LidoSDKstETH({ core: web3Core });
  const constructedWithRpc = new LidoSDKstETH({
    chainId,
    rpcUrls: [rpcUrl],
    logMode: 'none',
  });

  testERC20({
    contractName: LIDO_CONTRACT_NAMES.lido,
    constructedWithRpcCore,
    constructedWithWeb3Core,
    constructedWithRpc,
  });
});

import { describe } from '@jest/globals';
import { LidoSDKwstETH } from '../wsteth.js';
import {
  useRpcCore,
  useWeb3Core,
} from '../../../tests/utils/fixtures/use-core.js';
import { expectERC20 } from '../../../tests/utils/expect/expect-erc20.js';
import { LIDO_CONTRACT_NAMES } from '../../index.js';

describe('LidoSDKStake', () => {
  const rpcCore = useRpcCore();
  const web3Core = useWeb3Core();

  const constructedWithRpcCore = new LidoSDKwstETH({ core: rpcCore });
  const constructedWithWeb3Core = new LidoSDKwstETH({ core: web3Core });

  expectERC20({
    contractName: LIDO_CONTRACT_NAMES.wsteth,
    constructedWithRpcCore,
    constructedWithWeb3Core,
    ModulePrototype: LidoSDKwstETH,
  });
});

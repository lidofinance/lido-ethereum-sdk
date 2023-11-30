import { describe } from '@jest/globals';
import { LidoSDKstETH } from '../steth.js';
import {
  useRpcCore,
  useWeb3Core,
} from '../../../tests/utils/fixtures/use-core.js';
import { expectERC20 } from '../../../tests/utils/expect/expect-erc20.js';
import { LIDO_CONTRACT_NAMES } from '../../index.js';

describe('LidoSDKStake', () => {
  const rpcCore = useRpcCore();
  const web3Core = useWeb3Core();

  const constructedWithRpcCore = new LidoSDKstETH({ core: rpcCore });
  const constructedWithWeb3Core = new LidoSDKstETH({ core: web3Core });

  expectERC20({
    contractName: LIDO_CONTRACT_NAMES.lido,
    constructedWithRpcCore,
    constructedWithWeb3Core,
    ModulePrototype: LidoSDKstETH,
  });
});

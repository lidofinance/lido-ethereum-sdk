import { beforeAll, describe } from '@jest/globals';
import { LidoSDKwstETH } from '../wsteth.js';
import {
  useRpcCore,
  useWeb3Core,
} from '../../../tests/utils/fixtures/use-core.js';
import { expectERC20Wallet } from '../../../tests/utils/expect/expect-erc20-wallet.js';
import { LIDO_CONTRACT_NAMES } from '../../index.js';
import { SPENDING_TIMEOUT } from '../../../tests/utils/test-spending.js';
import { useWrap } from '../../../tests/utils/fixtures/use-wrap.js';
import { useTestsEnvs } from '../../../tests/utils/fixtures/use-test-envs.js';

describe('LidoSDKwstETH', () => {
  const rpcCore = useRpcCore();
  const web3Core = useWeb3Core();
  const wrap = useWrap();
  const { skipSpendingTests } = useTestsEnvs();

  const constructedWithRpcCore = new LidoSDKwstETH({ core: rpcCore });
  const constructedWithWeb3Core = new LidoSDKwstETH({ core: web3Core });

  beforeAll(async () => {
    if (!skipSpendingTests) await wrap.wrapEth({ value: 600n });
  }, SPENDING_TIMEOUT);

  expectERC20Wallet({
    contractName: LIDO_CONTRACT_NAMES.wsteth,
    constructedWithRpcCore,
    constructedWithWeb3Core,
  });
});

import { beforeAll, describe } from '@jest/globals';
import { LidoSDKstETH } from '../steth.js';
import {
  useRpcCore,
  useWeb3Core,
} from '../../../tests/utils/fixtures/use-core.js';
import { expectERC20Wallet } from '../../../tests/utils/expect/expect-erc20-wallet.js';
import { LIDO_CONTRACT_NAMES } from '../../index.js';
import { useStake } from '../../../tests/utils/fixtures/use-stake.js';
import { useTestsEnvs } from '../../../tests/utils/fixtures/use-test-envs.js';
import { SPENDING_TIMEOUT } from '../../../tests/utils/test-spending.js';

describe('LidoSDKstETH', () => {
  const rpcCore = useRpcCore();
  const web3Core = useWeb3Core();
  const stake = useStake();
  const { skipSpendingTests } = useTestsEnvs();

  const constructedWithRpcCore = new LidoSDKstETH({ core: rpcCore });
  const constructedWithWeb3Core = new LidoSDKstETH({ core: web3Core });

  beforeAll(async () => {
    if (!skipSpendingTests) await stake.stakeEth({ value: 500n });
  }, SPENDING_TIMEOUT);

  expectERC20Wallet({
    contractName: LIDO_CONTRACT_NAMES.lido,
    constructedWithRpcCore,
    constructedWithWeb3Core,
  });
});

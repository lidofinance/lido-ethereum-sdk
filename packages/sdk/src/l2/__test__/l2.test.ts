import { beforeAll, describe, test } from '@jest/globals';
import { expectSDKModule } from '../../../tests/utils/expect/expect-sdk-module.js';
import {
  useL2,
  useL2Rpc,
  useTestL2RpcProvider,
} from '../../../tests/utils/fixtures/use-l2.js';
import { LidoSDKL2 } from '../l2.js';
import { LidoSDKL2Steth, LidoSDKL2Wsteth } from '../tokens.js';
import { expectERC20 } from '../../../tests/utils/expect/expect-erc20.js';
import { LIDO_L2_CONTRACT_NAMES } from '../../common/constants.js';
import { expectERC20Wallet } from '../../../tests/utils/expect/expect-erc20-wallet.js';
import { useAccount } from '../../../tests/utils/fixtures/use-wallet-client.js';
import { getContract } from 'viem';
import { bridgedWstethAbi } from '../abi/brigedWsteth.js';

describe('LidoSDKL2', () => {
  test('is correct module', () => {
    expectSDKModule(LidoSDKL2);
  });
});

describe('LidoSDKL2Wsteth & LidoSDKL2Steth', () => {
  const l2 = useL2();
  const l2Rpc = useL2Rpc();
  const account = useAccount();
  const { testClient } = useTestL2RpcProvider();

  beforeAll(async () => {
    const wstethAddress = await l2.wsteth.contractAddress();

    const wstethImpersonated = getContract({
      abi: bridgedWstethAbi,
      address: wstethAddress,
      client: testClient,
    });

    const bridge = await wstethImpersonated.read.bridge();

    await testClient.setBalance({
      address: account.address,
      value: 100000000000000n,
    });

    await testClient.setBalance({
      address: bridge,
      value: 100000000000000n,
    });

    await testClient.request({
      method: 'evm_addAccount' as any,
      params: [bridge, 'pass'],
    });

    await testClient.request({
      method: 'personal_unlockAccount' as any,
      params: [bridge, 'pass'],
    });

    await wstethImpersonated.write.bridgeMint([account.address, 2000n], {
      account: bridge,
      chain: testClient.chain,
    });

    await l2.approveWstethForWrap({ value: 1000n, account });
    await l2.wrapWstethToSteth({ value: 1000n, account });
  });

  // wstETH erc20 tests
  expectERC20({
    contractName: LIDO_L2_CONTRACT_NAMES.wsteth,
    constructedWithWeb3Core: l2.wsteth,
    isL2: true,
    ModulePrototype: LidoSDKL2Wsteth,
    constructedWithRpcCore: l2Rpc.wsteth,
  });

  expectERC20Wallet({
    contractName: LIDO_L2_CONTRACT_NAMES.wsteth,
    constructedWithWeb3Core: l2.wsteth,
    isL2: true,
    constructedWithRpcCore: l2Rpc.wsteth,
  });

  // stETH erc20 tests
  expectERC20({
    ModulePrototype: LidoSDKL2Steth,
    contractName: LIDO_L2_CONTRACT_NAMES.steth,
    constructedWithWeb3Core: l2.steth,
    isL2: true,
    constructedWithRpcCore: l2Rpc.steth,
  });

  expectERC20Wallet({
    contractName: LIDO_L2_CONTRACT_NAMES.steth,
    constructedWithWeb3Core: l2.steth,
    isL2: true,
    constructedWithRpcCore: l2Rpc.steth,
  });
});

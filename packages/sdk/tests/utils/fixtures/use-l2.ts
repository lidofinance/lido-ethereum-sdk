import {
  http,
  createTestClient,
  createWalletClient,
  custom,
  type PrivateKeyAccount,
  type PublicClient,
  type TestClient,
  publicActions,
} from 'viem';
import { useTestsEnvs } from './use-test-envs.js';
import { CHAINS, LidoSDKCore, VIEM_CHAINS } from '../../../src/index.js';
import { useAccount } from './use-wallet-client.js';
import { LidoSDKL2 } from '../../../src/l2/l2.js';

let cached: {
  testClient: TestClient<'anvil'>;
} | null = null;

export const useTestL2RpcProvider = () => {
  if (cached) return cached;
  const { l2ChainId } = useTestsEnvs();

  const port = Number(process.env.VITEST_L2_ANVIL_PORT);
  const testClient = createTestClient({
    mode: 'anvil',
    transport: http(`http://127.0.0.1:${port}`),
    name: 'testClient',
    chain: VIEM_CHAINS[l2ChainId as CHAINS],
  });

  cached = { testClient };
  return cached;
};

let cachedPublicProvider: PublicClient | null = null;

export const usePublicL2RpcProvider = () => {
  if (cachedPublicProvider) return cachedPublicProvider;
  const { testClient } = useTestL2RpcProvider();
  const publicClient = testClient.extend(publicActions) as PublicClient;
  cachedPublicProvider = publicClient;
  return publicClient;
};

export const useL2WalletClient = (_account?: PrivateKeyAccount) => {
  const { l2ChainId } = useTestsEnvs();
  const { testClient } = useTestL2RpcProvider();
  const account = _account ?? useAccount();

  const chain = VIEM_CHAINS[l2ChainId as CHAINS];

  return createWalletClient({
    account,
    chain,
    transport: custom({ request: testClient.request }),
  });
};

let cachedWeb3Core: LidoSDKCore | null = null;

export const useL2Web3Core = () => {
  if (!cachedWeb3Core) {
    const walletClient = useL2WalletClient();
    const { l2ChainId } = useTestsEnvs();
    const publicClient = usePublicL2RpcProvider();
    cachedWeb3Core = new LidoSDKCore({
      chainId: l2ChainId,
      publicClient,
      logMode: 'none',
      walletClient,
    });
  }
  return cachedWeb3Core;
};

let cachedRpcCore: LidoSDKCore | null = null;

export const useL2RpcCore = () => {
  if (!cachedRpcCore) {
    const { l2ChainId } = useTestsEnvs();
    const publicClient = usePublicL2RpcProvider();
    cachedRpcCore = new LidoSDKCore({
      chainId: l2ChainId,
      publicClient,
      logMode: 'none',
    });
  }
  return cachedRpcCore;
};

export const useL2Rpc = () => {
  const rpcCore = useL2RpcCore();
  return new LidoSDKL2({ core: rpcCore });
};

export const useL2 = () => {
  const web3Core = useL2Web3Core();
  return new LidoSDKL2({ core: web3Core });
};

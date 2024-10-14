import type { EthereumProvider } from 'ganache';
import {
  createTestClient,
  createWalletClient,
  custom,
  PrivateKeyAccount,
  publicActions,
  PublicClient,
  TestClient,
} from 'viem';
import { useTestsEnvs } from './use-test-envs.js';
import { CHAINS, LidoSDKCore, VIEM_CHAINS } from '../../../src/index.js';
import { useAccount } from './use-wallet-client.js';
import { LidoSDKL2 } from '../../../src/l2/l2.js';

let cached: {
  testClient: TestClient<'ganache'>;
  ganacheProvider: EthereumProvider;
} | null = null;

export const useTestL2RpcProvider = () => {
  if (cached) return cached;
  const { l2ChainId } = useTestsEnvs();

  const ganacheProvider = (globalThis as any)
    .__l2_ganache_provider__ as EthereumProvider;

  const testClient = createTestClient({
    mode: 'ganache',
    transport: custom({
      async request(args) {
        if (args.method === 'eth_estimateGas') {
          delete args.params[0].gas;
        }
        return ganacheProvider.request(args);
      },
    }),
    name: 'testClient',
    chain: VIEM_CHAINS[l2ChainId as CHAINS],
  });

  cached = { ganacheProvider, testClient };
  return cached;
};

let cachedPublicProvider: PublicClient | null = null;

export const usePublicL2RpcProvider = () => {
  if (cachedPublicProvider) return cachedPublicProvider;
  const { testClient } = useTestL2RpcProvider();
  const rpcProvider = testClient.extend(publicActions) as PublicClient;
  cachedPublicProvider = rpcProvider;
  return rpcProvider;
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
    const rpcProvider = usePublicL2RpcProvider();
    cachedWeb3Core = new LidoSDKCore({
      chainId: l2ChainId,
      rpcProvider: rpcProvider,
      logMode: 'none',
      web3Provider: walletClient,
    });
  }
  return cachedWeb3Core;
};

let cachedRpcCore: LidoSDKCore | null = null;

export const useL2RpcCore = () => {
  if (!cachedRpcCore) {
    const { l2ChainId } = useTestsEnvs();
    const rpcProvider = usePublicL2RpcProvider();
    cachedRpcCore = new LidoSDKCore({
      chainId: l2ChainId,
      rpcProvider: rpcProvider,
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

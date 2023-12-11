import type { EthereumProvider } from 'ganache';
import {
  createTestClient,
  custom,
  publicActions,
  PublicClient,
  TestClient,
} from 'viem';
import { useTestsEnvs } from './use-test-envs.js';
import { CHAINS, VIEM_CHAINS } from '../../../src/index.js';

let cached: {
  testClient: TestClient<'ganache'>;
  ganacheProvider: EthereumProvider;
} | null = null;

export const useTestRpcProvider = () => {
  if (cached) return cached;
  const { chainId } = useTestsEnvs();

  const ganacheProvider = (globalThis as any)
    .__ganache_provider__ as EthereumProvider;

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
    chain: VIEM_CHAINS[chainId as CHAINS],
  });
  cached = { ganacheProvider, testClient };
  return cached;
};

let cachedPublicProvider: PublicClient | null = null;

export const usePublicRpcProvider = () => {
  if (cachedPublicProvider) return cachedPublicProvider;
  const { testClient } = useTestRpcProvider();
  const rpcProvider = testClient.extend(publicActions) as PublicClient;
  cachedPublicProvider = rpcProvider;
  return rpcProvider;
};

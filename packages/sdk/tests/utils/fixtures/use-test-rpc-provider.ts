import type { EthereumProvider } from 'ganache';
import {
  createPublicClient,
  createTestClient,
  custom,
  CustomTransport,
  PublicClient,
  TestClient,
} from 'viem';
import { useTestsEnvs } from './use-test-envs.js';
import { CHAINS, VIEM_CHAINS } from '../../../src/index.js';

let cached: {
  testClient: TestClient<'ganache', CustomTransport>;
  ganacheProvider: EthereumProvider;
} | null = null;

export const useTestRpcProvider = () => {
  if (cached) return cached;
  const { chainId } = useTestsEnvs();

  const ganacheProvider = (globalThis as any)
    .__ganache_provider__ as EthereumProvider;

  const testClient = createTestClient({
    mode: 'ganache',
    transport: custom(ganacheProvider),
    chain: VIEM_CHAINS[chainId as CHAINS],
  });
  cached = { ganacheProvider, testClient };
  return cached;
};

let cachedPublicProvider: PublicClient<CustomTransport> | null = null;

export const usePublicRpcProvider = () => {
  if (cachedPublicProvider) return cachedPublicProvider;
  const { chainId } = useTestsEnvs();
  const { ganacheProvider } = useTestRpcProvider();
  const rpcProvider = createPublicClient({
    chain: VIEM_CHAINS[chainId as CHAINS],
    transport: custom(ganacheProvider),
    batch: { multicall: true },
  });
  cachedPublicProvider = rpcProvider;
  return rpcProvider;
};

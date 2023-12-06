import { provider } from 'ganache';
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

let cachedProvider: TestClient<'ganache', CustomTransport> | null = null;

export const useTestRpcProvider = () => {
  if (cachedProvider) return cachedProvider;
  const { rpcUrl, chainId } = useTestsEnvs();
  const ganacheProvider = provider({
    fork: { url: rpcUrl },
    logging: { quiet: true },
    chain: { chainId },
  });
  const testClient = createTestClient({
    mode: 'ganache',
    transport: custom(ganacheProvider),
    chain: VIEM_CHAINS[chainId as CHAINS],
  });
  cachedProvider = testClient;
  return testClient;
};

let cachedPublicProvider: PublicClient<CustomTransport> | null = null;

export const usePublicRpcProvider = () => {
  if (cachedPublicProvider) return cachedPublicProvider;
  const { chainId } = useTestsEnvs();
  const client = useTestRpcProvider();
  const rpcProvider = createPublicClient({
    chain: VIEM_CHAINS[chainId as CHAINS],
    transport: custom(client.transport),
    batch: { multicall: true },
  });
  cachedPublicProvider = rpcProvider;
  return rpcProvider;
};

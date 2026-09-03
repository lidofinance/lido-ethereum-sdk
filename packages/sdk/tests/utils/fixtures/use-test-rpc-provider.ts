import {
  http,
  createTestClient,
  publicActions,
  type PublicClient,
  type TestClient,
} from 'viem';
import { useTestsEnvs } from './use-test-envs.js';
import { useAnvilUrl } from './use-anvil-url.js';
import { CHAINS, VIEM_CHAINS } from '../../../src/index.js';

let cached: {
  testClient: TestClient<'anvil'>;
} | null = null;

export const useTestRpcProvider = () => {
  if (cached) return cached;
  const { chainId } = useTestsEnvs();

  const testClient = createTestClient({
    mode: 'anvil',
    transport: http(useAnvilUrl()),
    name: 'testClient',
    chain: VIEM_CHAINS[chainId as CHAINS],
  });
  cached = { testClient };
  return cached;
};

let cachedPublicProvider: PublicClient | null = null;

export const usePublicRpcProvider = () => {
  if (cachedPublicProvider) return cachedPublicProvider;
  const { testClient } = useTestRpcProvider();
  const publicClient = testClient.extend(publicActions) as PublicClient;
  cachedPublicProvider = publicClient;
  return publicClient;
};

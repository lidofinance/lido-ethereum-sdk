import { privateKeyToAccount } from 'viem/accounts';
import { Hash, createWalletClient, http } from 'viem';
import { useTestsEnvs } from './use-test-envs.js';
import { CHAINS, VIEM_CHAINS } from '../../../src/index.js';

export const useWalletClient = () => {
  const { privateKey, chainId, rpcUrl } = useTestsEnvs();
  const account = privateKeyToAccount(privateKey as Hash);

  const chain = VIEM_CHAINS[chainId as CHAINS];

  // TODO: research, for some reason, private rpc does not work as wallet rpc in CI
  const rpc =
    chainId === 17000 ? 'https://ethereum-holesky.publicnode.com' : rpcUrl;

  return createWalletClient({
    account,
    chain,
    transport: http(rpc),
  });
};

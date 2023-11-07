import { LidoSDKCore } from '../../src/core/index.js';
import { useTestsEnvs } from './use-test-envs.js';
import { useWalletClient } from './use-wallet-client.js';

export const useRpcCore = () => {
  const { chainId, rpcUrl } = useTestsEnvs();
  return new LidoSDKCore({
    chainId: chainId,
    rpcUrls: [rpcUrl],
    logMode: 'none',
  });
};

export const useWeb3Core = () => {
  const walletClient = useWalletClient();
  const { chainId, rpcUrl } = useTestsEnvs();
  return new LidoSDKCore({
    chainId: chainId,
    rpcUrls: [rpcUrl],
    logMode: 'none',
    web3Provider: walletClient,
  });
};

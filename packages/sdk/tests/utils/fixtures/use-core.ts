import { LidoSDKCore } from '../../../src/core/index.js';
import { useTestsEnvs } from './use-test-envs.js';
import { useWalletClient } from './use-wallet-client.js';

let cachedRpcCore: LidoSDKCore | null = null;

export const useRpcCore = () => {
  const { chainId, rpcUrl } = useTestsEnvs();
  if (!cachedRpcCore)
    cachedRpcCore = new LidoSDKCore({
      chainId: chainId,
      rpcUrls: [rpcUrl],
      logMode: 'none',
    });
  return cachedRpcCore;
};

let cachedWeb3Core: LidoSDKCore | null = null;

export const useWeb3Core = () => {
  const walletClient = useWalletClient();
  const { chainId, rpcUrl } = useTestsEnvs();
  if (!cachedWeb3Core)
    cachedWeb3Core = new LidoSDKCore({
      chainId: chainId,
      rpcUrls: [rpcUrl],
      logMode: 'none',
      web3Provider: walletClient,
    });
  return cachedWeb3Core;
};

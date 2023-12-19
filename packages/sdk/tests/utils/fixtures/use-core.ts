import { LidoSDKCore } from '../../../src/core/index.js';
import { useTestsEnvs } from './use-test-envs.js';
import { usePublicRpcProvider } from './use-test-rpc-provider.js';
import { useWalletClient } from './use-wallet-client.js';

let cachedRpcCore: LidoSDKCore | null = null;

export const useRpcCore = () => {
  const { chainId } = useTestsEnvs();

  if (!cachedRpcCore) {
    const rpcProvider = usePublicRpcProvider();
    cachedRpcCore = new LidoSDKCore({
      chainId: chainId,
      logMode: 'none',
      rpcProvider: rpcProvider,
    });
  }
  return cachedRpcCore;
};

let cachedDirectRpcCore: LidoSDKCore | null = null;

export const useDirectRpcCore = () => {
  const { chainId, rpcUrl } = useTestsEnvs();

  if (!cachedDirectRpcCore) {
    cachedDirectRpcCore = new LidoSDKCore({
      chainId: chainId,
      logMode: 'none',
      rpcUrls: [rpcUrl],
    });
  }
  return cachedDirectRpcCore;
};

let cachedWeb3Core: LidoSDKCore | null = null;

export const useWeb3Core = () => {
  if (!cachedWeb3Core) {
    const walletClient = useWalletClient();
    const { chainId } = useTestsEnvs();
    const rpcProvider = usePublicRpcProvider();
    cachedWeb3Core = new LidoSDKCore({
      chainId: chainId,
      rpcProvider: rpcProvider,
      logMode: 'none',
      web3Provider: walletClient,
    });
  }
  return cachedWeb3Core;
};

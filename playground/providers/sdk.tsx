import { createContext, useMemo, PropsWithChildren, useContext } from 'react';

import { LidoSDK } from '@lidofinance/lido-ethereum-sdk';
import invariant from 'tiny-invariant';
import { usePublicClient, useWalletClient } from 'wagmi';

const context = createContext<LidoSDK | null>(null);

export const useLidoSDK = () => {
  const value = useContext(context);
  invariant(value, 'useLidoSDK was used outside LidoSDKProvider');
  return value;
};

export const LidoSDKProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const publicClient = usePublicClient();
  const chainId = publicClient?.chain.id;
  const { data: walletClient } = useWalletClient();

  const value = useMemo(() => {
    const sdk = new LidoSDK({
      chainId: chainId as any,
      rpcProvider: publicClient as any,
      web3Provider: walletClient as any,
      logMode: 'debug',
    });
    // inject lido_sdk for console access
    if (typeof window !== 'undefined') (window as any).lido_sdk = sdk;
    return sdk;
  }, [chainId, publicClient, walletClient]);

  return <context.Provider value={value}>{children}</context.Provider>;
};

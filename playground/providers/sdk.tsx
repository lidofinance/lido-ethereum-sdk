import { createContext, useMemo, PropsWithChildren, useContext } from 'react';
import { useSDK } from '@lido-sdk/react';

import { LidoSDK } from '@lidofinance/lido-ethereum-sdk';
import invariant from 'tiny-invariant';
import { getBackendRPCPath } from 'config';

const context = createContext<LidoSDK | null>(null);

export const useLidoSDK = () => {
  const value = useContext(context);
  invariant(value, 'useLidoSDK was used outside LidoSDKProvider');
  return value;
};

export const LidoSDKProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const { providerRpc, providerWeb3, chainId } = useSDK();
  const value = useMemo(() => {
    return new LidoSDK({
      chainId: chainId as any,
      rpcUrls: [getBackendRPCPath(chainId)],
      web3Provider: providerWeb3?.provider as any,
    });
  }, [providerRpc, providerWeb3, chainId]);

  return <context.Provider value={value}>{children}</context.Provider>;
};

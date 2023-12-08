import { createContext, useMemo, PropsWithChildren, useContext } from 'react';
import { useSDK } from '@lido-sdk/react';

import { createWalletClient, custom } from 'viem';

import { LidoSDK } from '@lidofinance/lido-ethereum-sdk';
import invariant from 'tiny-invariant';
import { useCustomRpc } from './web3';

const context = createContext<LidoSDK | null>(null);

export const useLidoSDK = () => {
  const value = useContext(context);
  invariant(value, 'useLidoSDK was used outside LidoSDKProvider');
  return value;
};

export const LidoSDKProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const { providerWeb3, chainId, account } = useSDK();
  const { activeRpc } = useCustomRpc();
  const value = useMemo(() => {
    const client =
      providerWeb3 && account
        ? createWalletClient({
            transport: custom(providerWeb3.provider as any),
          })
        : undefined;
    const sdk = new LidoSDK({
      chainId: chainId as any,
      rpcUrls: [activeRpc[chainId]],
      web3Provider: client as any,
      logMode: 'debug',
    });
    // inject lido_sdk for console access
    if (typeof window !== 'undefined') (window as any).lido_sdk = sdk;
    return sdk;
  }, [providerWeb3, chainId, account, activeRpc]);

  return <context.Provider value={value}>{children}</context.Provider>;
};

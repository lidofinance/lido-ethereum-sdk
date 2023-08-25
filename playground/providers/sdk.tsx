import {
  createContext,
  useMemo,
  useCallback,
  memo,
  useState,
  FC,
  PropsWithChildren,
  useContext,
} from 'react';
import { useSDK } from '@lido-sdk/react';

import { LidoSDK } from '@lidofinance/lido-ethereum-sdk';
import invariant from 'tiny-invariant';
import { useWeb3 } from '@reef-knot/web3-react';
import { getBackendRPCPath } from 'config';

const context = createContext<LidoSDK | null>(null);

export const useLidoSDK = () => {
  const value = useContext(context);
  invariant(value, 'useLidoSDK was used outside LidoSDKProvider')
  return value
}

export const LidoSDKProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const { providerRpc, providerWeb3, chainId } = useSDK()
  const value = useMemo(() => {
    // @ts-ignore
    return new LidoSDK({ chainId: chainId as any, rpcUrls: [getBackendRPCPath(chainId)], web3Provider: providerWeb3 })
  }, [providerRpc, providerWeb3, chainId])

  return <context.Provider value={value}>{children}</context.Provider>
}

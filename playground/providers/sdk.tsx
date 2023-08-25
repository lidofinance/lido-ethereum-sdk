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

import { LidoSDK } from '@lidofinance/lido-ethereum-sdk';
import invariant from 'tiny-invariant';
import { useWeb3 } from '@reef-knot/web3-react';

const context = createContext<LidoSDK | null>(null);

export const useLidoSDK = () => {
  const value = useContext(context);
  invariant(value, 'useLidoSDK was used outside LidoSDKProvider')
  return value
}

export const LidoSDKProvider: React.FC<PropsWithChildren> = ({ children }) => {
  return <context.Provider value={null}>{children}</context.Provider>
}

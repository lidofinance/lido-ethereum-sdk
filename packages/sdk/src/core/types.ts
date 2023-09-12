import { WalletClient, PublicClient } from 'viem';

import { SUPPORTED_CHAINS } from '../common/constants.js';

type LidoSDKCorePropsRpcUrls = {
  chainId: (typeof SUPPORTED_CHAINS)[number];
  rpcUrls: string[];
  web3Provider?: WalletClient;
  rpcProvider?: undefined;
};
type LidoSDKCorePropsRpcProvider = {
  chainId: (typeof SUPPORTED_CHAINS)[number];
  rpcUrls: undefined;
  web3Provider?: WalletClient;
  rpcProvider: PublicClient;
};

export type LidoSDKCoreProps =
  | LidoSDKCorePropsRpcUrls
  | LidoSDKCorePropsRpcProvider;

export type EtherValue = string | bigint;

import { CHAINS } from '@lido-sdk/constants';
import getConfig from 'next/config';

const { serverRuntimeConfig } = getConfig();

export const getBackendRPCPath = (chainId: CHAINS) => {
  switch (chainId) {
    case CHAINS.Mainnet:
      return 'https://rpc.ankr.com/eth';
    case CHAINS.Goerli:
      return 'https://rpc.ankr.com/eth_goerli';
    default:
      return '';
  }
};

export const backendRPC = {
  [CHAINS.Mainnet]: 'https://rpc.ankr.com/eth',
  [CHAINS.Goerli]: 'https://rpc.ankr.com/eth_goerli',
};

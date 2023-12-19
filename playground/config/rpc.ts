import { CHAINS } from '@lido-sdk/constants';
import dynamics from './dynamics';

export const getBackendRPCPath = (chainId: CHAINS) => {
  return dynamics.rpcProviderUrls[chainId];
};

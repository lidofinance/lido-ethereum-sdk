import { CHAINS } from '@lido-sdk/constants';
import dynamics from './dynamics';

export const getBackendRPCPath = (chainId: CHAINS) => {
  return dynamics.rpcProviderUrls[chainId];
};

export const backendRPC = {
  [CHAINS.Mainnet]: getBackendRPCPath(CHAINS.Mainnet),
  [CHAINS.Goerli]: getBackendRPCPath(CHAINS.Goerli),
  [CHAINS.Holesky]: getBackendRPCPath(CHAINS.Holesky),
};

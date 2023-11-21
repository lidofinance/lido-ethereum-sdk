import { LidoSDKShares } from '../../../src/index.js';
import { useWeb3Core } from './use-core.js';

export const useShares = () => {
  const web3Core = useWeb3Core();
  const shares = new LidoSDKShares({ core: web3Core });
  return shares;
};

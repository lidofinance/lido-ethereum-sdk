import { useWeb3Core } from './use-core.js';
import { LidoSDKStake } from '../../../src/stake/stake.js';

export const useStake = () => {
  const web3Core = useWeb3Core();
  const stake = new LidoSDKStake({ core: web3Core });
  return stake;
};

import { useWeb3Core } from '../../../tests/utils/use-core.js';
import { LidoSDKStake } from '../stake.js';

export const useStake = () => {
  const web3Core = useWeb3Core();
  const stake = new LidoSDKStake({ core: web3Core });
  return stake;
};

import { LidoSDKstETH } from '../../../src/index.js';
import { useWeb3Core } from './use-core.js';

export const useSteth = () => {
  const web3Core = useWeb3Core();
  const steth = new LidoSDKstETH({ core: web3Core });
  return steth;
};

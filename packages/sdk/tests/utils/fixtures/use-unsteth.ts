import { LidoSDKUnstETH } from '../../../src/index.js';
import { useWeb3Core } from './use-core.js';

export const useUnsteth = () => {
  const web3Core = useWeb3Core();
  return new LidoSDKUnstETH({ core: web3Core });
};

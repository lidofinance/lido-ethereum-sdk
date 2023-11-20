import { LidoSDKwstETH } from '../../../src/index.js';
import { useWeb3Core } from './use-core.js';

export const useWsteth = () => {
  const web3Core = useWeb3Core();
  const wsteth = new LidoSDKwstETH({ core: web3Core });
  return wsteth;
};

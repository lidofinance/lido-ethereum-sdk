import { LidoSDKWithdraw } from '../../../src/index.js';
import { useWeb3Core } from './use-core.js';

export const useWithdraw = () => {
  const web3Core = useWeb3Core();
  return new LidoSDKWithdraw({ core: web3Core });
};

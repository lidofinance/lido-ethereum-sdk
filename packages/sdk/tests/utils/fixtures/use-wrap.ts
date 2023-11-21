import { LidoSDKWrap } from '../../../src/index.js';
import { useWeb3Core } from './use-core.js';

export const useWrap = () => {
  const web3Core = useWeb3Core();
  const wrap = new LidoSDKWrap({ core: web3Core });
  return wrap;
};

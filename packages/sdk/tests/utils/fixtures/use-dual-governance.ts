import { useWeb3Core } from './use-core.js';
import { LidoSDKDualGovernance} from '../../../src/dual-governance/index.js';

export const useDualGovernance = () => {
  const web3Core = useWeb3Core();
  const dualGovernance = new LidoSDKDualGovernance({ core: web3Core });
  return dualGovernance;
};

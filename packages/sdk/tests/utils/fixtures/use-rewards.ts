import { LidoSDKRewards } from '../../../src/index.js';
import { useDirectRpcCore, useRpcCore } from './use-core.js';

type UseModuleOptions = {
  useDirectRpc?: boolean;
};

export const useRewards = ({ useDirectRpc = false }: UseModuleOptions = {}) => {
  const core = useDirectRpc ? useDirectRpcCore() : useRpcCore();
  const rewards = new LidoSDKRewards({ core });
  return rewards;
};

import { LidoSDKStatistics } from '../../../src/index.js';
import { useDirectRpcCore, useRpcCore } from './use-core.js';

type UseModuleOptions = {
  useDirectRpc?: boolean;
};

export const useStats = ({ useDirectRpc = false }: UseModuleOptions = {}) => {
  const core = useDirectRpc ? useDirectRpcCore() : useRpcCore();
  const stats = new LidoSDKStatistics({ core });
  return stats;
};

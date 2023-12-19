import { LidoSDKEvents } from '../../../src/index.js';
import { useDirectRpcCore, useRpcCore } from './use-core.js';

type UseModuleOptions = {
  useDirectRpc?: boolean;
};

export const useEvents = ({ useDirectRpc = false }: UseModuleOptions = {}) => {
  const core = useDirectRpc ? useDirectRpcCore() : useRpcCore();
  const events = new LidoSDKEvents({ core });
  return events;
};

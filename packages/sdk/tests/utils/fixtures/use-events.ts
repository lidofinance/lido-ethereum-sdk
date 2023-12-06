import { LidoSDKEvents } from '../../../src/index.js';
import { useRpcCore } from './use-core.js';

export const useEvents = () => {
  const core = useRpcCore();
  const events = new LidoSDKEvents({ core });
  return events;
};

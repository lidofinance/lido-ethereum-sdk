import { type LidoSDKCoreProps, type LidoSDKCore } from '../core/index.js';

export type LidoSDKEventsProps = LidoSDKCoreProps & {
  core?: LidoSDKCore;
};

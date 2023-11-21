import { LidoSDKCacheable } from '../common/class-primitives/cacheable.js';
import { type Bus } from './bus.js';
import { type LidoSDKWithdrawModuleProps } from './types.js';

export class BusModule extends LidoSDKCacheable {
  protected readonly bus: Bus;
  protected version: string | undefined;

  constructor(props: LidoSDKWithdrawModuleProps) {
    super();
    this.bus = props.bus;
    this.version = props.version;
  }
}

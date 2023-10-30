import { type Bus } from './bus.js';
import { type LidoSDKWithdrawModuleProps } from './types.js';

export class BusModule {
  protected readonly bus: Bus;
  protected version: string | undefined;

  constructor(props: LidoSDKWithdrawModuleProps) {
    this.bus = props.bus;
    this.version = props.version;
  }
}

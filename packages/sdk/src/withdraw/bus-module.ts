import { type Bus } from './bus.js';
import { type LidoSDKWithdrawModuleProps } from './types.js';

export class BusModule {
  protected readonly bus: Bus;

  constructor(props: LidoSDKWithdrawModuleProps) {
    this.bus = props.bus;
  }
}

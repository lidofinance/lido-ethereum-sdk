import { LidoSDKModule } from '../common/class-primitives/sdk-module.js';

import { LidoSDKStethEvents } from './steth-events.js';
import type { LidoSDKEventsProps } from './types.js';

export class LidoSDKEvents extends LidoSDKModule {
  readonly stethEvents: LidoSDKStethEvents;

  constructor(props: LidoSDKEventsProps) {
    super(props);

    this.stethEvents = new LidoSDKStethEvents({ ...props, core: this.core });
  }
}

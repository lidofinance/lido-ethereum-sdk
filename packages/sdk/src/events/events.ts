import { LidoSDKModule } from '../common/class-primitives/sdk-module.js';
import { LidoSDKCommonProps } from '../core/types.js';

import { LidoSDKStethEvents } from './steth-events.js';

export class LidoSDKEvents extends LidoSDKModule {
  readonly stethEvents: LidoSDKStethEvents;

  constructor(props: LidoSDKCommonProps) {
    super(props);

    this.stethEvents = new LidoSDKStethEvents({ ...props, core: this.core });
  }
}

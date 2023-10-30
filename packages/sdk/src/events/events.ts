import { LidoSDKCore } from '../core/index.js';
import { version } from '../version.js';

import { LidoSDKStethEvents } from './steth-events.js';
import type { LidoSDKEventsProps } from './types.js';

export class LidoSDKEvents {
  readonly core: LidoSDKCore;
  readonly stethEvents: LidoSDKStethEvents;

  constructor(props: LidoSDKEventsProps) {
    const { core } = props;

    if (core) this.core = core;
    else this.core = new LidoSDKCore(props, version);

    this.stethEvents = new LidoSDKStethEvents({ ...props, core: this.core });
  }
}

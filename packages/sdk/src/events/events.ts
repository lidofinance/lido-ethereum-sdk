import { LidoSDKCore } from '../core/index.js';
import { version } from '../version.js';

import { LidoSDKStethEvents } from './stethEvents.js';
import type { LidoSDKEventsProps } from './types.js';

export class LidoSDKEvents {
  readonly core: LidoSDKCore;
  readonly stethEvents: LidoSDKStethEvents;

  constructor(props: LidoSDKEventsProps) {
    const { core, ...rest } = props;

    if (core) this.core = core;
    else this.core = new LidoSDKCore(rest, version);

    this.stethEvents = new LidoSDKStethEvents({ ...rest, core: this.core });
  }
}

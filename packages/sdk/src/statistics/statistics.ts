import { LidoSDKCore } from '../core/index.js';
import { version } from '../version.js';

import { LidoSDKApr } from './apr.js';
import type { LidoSDKStatisticsProps } from './types.js';

export class LidoSDKStatistics {
  readonly core: LidoSDKCore;
  readonly apr: LidoSDKApr;

  constructor(props: LidoSDKStatisticsProps) {
    const { core } = props;

    if (core) this.core = core;
    else this.core = new LidoSDKCore(props, version);

    this.apr = new LidoSDKApr({ ...props, core: this.core });
  }
}

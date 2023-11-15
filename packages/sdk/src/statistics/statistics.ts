import { LidoSDKModule } from '../common/class-primitives/sdk-module.js';
import { LidoSDKCommonProps } from '../core/types.js';

import { LidoSDKApr } from './apr.js';

export class LidoSDKStatistics extends LidoSDKModule {
  readonly apr: LidoSDKApr;

  constructor(props: LidoSDKCommonProps) {
    super(props);

    this.apr = new LidoSDKApr({ ...props, core: this.core });
  }
}

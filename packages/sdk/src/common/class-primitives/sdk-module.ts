import LidoSDKCore from '../../core/core.js';
import type { LidoSDKCommonProps } from '../../core/types.js';
import { version } from '../../version.js';
import { LidoSDKCacheable } from './cacheable.js';

export abstract class LidoSDKModule extends LidoSDKCacheable {
  readonly core: LidoSDKCore;

  constructor(props: LidoSDKCommonProps) {
    super();
    const { core } = props;

    if (core) this.core = core;
    else this.core = new LidoSDKCore(props, version);
  }
}

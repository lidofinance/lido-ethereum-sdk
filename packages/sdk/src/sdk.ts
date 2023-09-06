import { LidoSDKCore, LidoSDKCoreProps } from './core/index.js';
import { LidoSDKStaking } from './staking/index.js';

import { version } from './version.js';
import { LidoSDKWrap } from './wrap/wrap.js';

export class LidoSDK {
  readonly core: LidoSDKCore;
  readonly staking: LidoSDKStaking;
  readonly wrap: LidoSDKWrap;

  constructor(props: LidoSDKCoreProps) {
    // Core functionality
    this.core = new LidoSDKCore(props, version);
    // Staking functionality
    this.staking = new LidoSDKStaking({ ...props, core: this.core });
    // Wrap functionality
    this.wrap = new LidoSDKWrap({ ...props, core: this.core });
  }
}

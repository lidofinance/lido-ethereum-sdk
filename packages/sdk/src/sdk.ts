import { LidoSDKCore, LidoSDKCoreProps } from "./core/index.js";
import { LidoSDKStaking } from "./staking/index.js";

import { version } from "./version.js";

export class LidoSDK {
  readonly core: LidoSDKCore;
  readonly staking: LidoSDKStaking;

  constructor(props: LidoSDKCoreProps) {
    // Core functionality
    this.core = new LidoSDKCore(props, version);
    // Staking functionality
    this.staking = new LidoSDKStaking({ ...props, core: this.core });
  }
}

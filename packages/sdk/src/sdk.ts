import { LidoSDKCore, LidoSDKCoreProps } from "./core/index.js";
import { LidoSDKStaking } from "./staking/index.js";

import { version } from "./version.js";

export class LidoSDK {
  readonly core: LidoSDKCore;
  readonly staking: LidoSDKStaking;

  constructor(props: LidoSDKCoreProps) {
    this.core = new LidoSDKCore(props, version);
    this.staking = new LidoSDKStaking({ ...props, core: this.core });
  }
}

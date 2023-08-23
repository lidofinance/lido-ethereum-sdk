import { LidoSDKCore, LidoSDKCoreProps } from "./core/index.js";
import { LidoSDKStake } from "./stake/index.js";

import { version } from "./version.js";

export class LidoSDK {
  readonly core: LidoSDKCore;
  readonly staking: LidoSDKStake;

  constructor(props: LidoSDKCoreProps) {
    this.core = new LidoSDKCore(props, version);
    this.staking = new LidoSDKStake({ ...props, core: this.core });
  }
}

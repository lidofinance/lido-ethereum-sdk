import { LidoSDKCore, LidoSDKCoreProps } from "./core";
import { LidoSDKStake } from "./stake";

import { version } from "./version";

export class LidoSDK {
  readonly core: LidoSDKCore;
  readonly staking: LidoSDKStake;

  constructor(props: LidoSDKCoreProps) {
    this.core = new LidoSDKCore(props, version);
    this.staking = new LidoSDKStake({ ...props, core: this.core });
  }
}

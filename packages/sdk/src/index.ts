import { LidoSDKCore, LidoSDKCoreProps } from "@lidofinance/lido-sdk-core";
import { LidoSDKStake } from "@lidofinance/lido-sdk-stake";

export class LidoSDK {
  readonly core: LidoSDKCore;
  readonly staking: LidoSDKStake;

  constructor(props: LidoSDKCoreProps) {
    this.core = new LidoSDKCore(props);
    this.staking = new LidoSDKStake({ ...props, core: this.core });
  }
}

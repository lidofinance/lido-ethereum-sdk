import { LidoSDKCore, LidoSDKCoreProps } from "@lidofinance/lido-sdk-core";
import { LidoSDKStake } from "@lidofinance/lido-sdk-stake";

export class LidoSDK extends LidoSDKCore {
  constructor(props: LidoSDKCoreProps) {
    super(props);
  }

  staking = new LidoSDKStake(this);
}

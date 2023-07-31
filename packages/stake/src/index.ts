import { LidoSDKCore } from "@lidofinance/lido-sdk-core";

export class LidoSDKStake {
  constructor(core: LidoSDKCore) {
    console.log("LidoSDKStake");
  }

  submit(): Promise<void> {
    console.log("submit");
    return Promise.resolve();
  }
}

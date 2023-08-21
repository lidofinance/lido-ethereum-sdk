import {
  type LidoSDKCoreProps,
  type LidoSDKCore,
} from "@lidofinance/lido-sdk-core";

export type LidoSDKStakeProps = LidoSDKCoreProps & {
  core?: LidoSDKCore;
};

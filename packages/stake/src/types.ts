import { type Address } from "viem";
import {
  type LidoSDKCoreProps,
  type LidoSDKCore,
} from "@lidofinance/lido-sdk-core";

export type LidoSDKStakeProps = LidoSDKCoreProps & {
  core?: LidoSDKCore;
};

export enum StakeCallbackStage {
  "SIGN" = "sign",
  "RECEIPT" = "receipt",
  "CONFIRMATION" = "confirmation",
  "DONE" = "done",
  "MULTISIG_DONE" = "multisig_done",
}

export type StageCallback = (
  stage: StakeCallbackStage,
  payload?: unknown
) => void;
export type StakeProps = {
  value: string;
  callback: StageCallback;
  referralAddress?: Address;
};

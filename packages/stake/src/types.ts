import { type Address, type Hash, type TransactionReceipt } from "viem";
import {
  type LidoSDKCoreProps,
  type LidoSDKCore,
  type SDKError,
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
  "ERROR" = "error",
}

export type StakeCallbackProps =
  | { stage: StakeCallbackStage.SIGN; payload?: undefined }
  | { stage: StakeCallbackStage.RECEIPT; payload: Hash }
  | { stage: StakeCallbackStage.CONFIRMATION; payload: TransactionReceipt }
  | { stage: StakeCallbackStage.DONE; payload: bigint }
  | { stage: StakeCallbackStage.MULTISIG_DONE; payload?: undefined }
  | { stage: StakeCallbackStage.ERROR; payload: SDKError };

export type StageCallback = (props: StakeCallbackProps) => void;

export type StakeProps = {
  value: string;
  callback: StageCallback;
  referralAddress?: Address;
};

export type StakeResult = {
  hash: Hash;
  receipt?: TransactionReceipt;
  confirmations?: bigint;
};

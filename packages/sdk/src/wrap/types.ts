import { type Address, type Hash, type TransactionReceipt } from 'viem';
import LidoSDKCore from '../core/core.js';
import { LidoSDKCoreProps } from '../core/types.js';
import { SDKError } from '../common/utils/SDKError.js';

export type LidoSDKWrapProps = LidoSDKCoreProps & {
  core?: LidoSDKCore;
};

export type WrapEthProps = {
  value: string;
  account: Address;
  callback?: WrapStageCallback;
};

export enum WrapCallbackStage {
  'SIGN' = 'sign',
  'RECEIPT' = 'receipt',
  'CONFIRMATION' = 'confirmation',
  'DONE' = 'done',
  'MULTISIG_DONE' = 'multisig_done',
  'ERROR' = 'error',
}

export type WrapStageCallback = (props: WrapCallbackProps) => void;

export type WrapCallbackProps =
  | { stage: WrapCallbackStage.SIGN; payload?: undefined }
  | { stage: WrapCallbackStage.RECEIPT; payload: Hash }
  | { stage: WrapCallbackStage.CONFIRMATION; payload: TransactionReceipt }
  | { stage: WrapCallbackStage.DONE; payload: bigint }
  | { stage: WrapCallbackStage.MULTISIG_DONE; payload?: undefined }
  | { stage: WrapCallbackStage.ERROR; payload: SDKError };

export type WrapResult = {
  hash: Hash;
  receipt?: TransactionReceipt;
  confirmations?: bigint;
};

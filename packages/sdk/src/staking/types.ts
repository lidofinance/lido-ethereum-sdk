import { type Address, type Hash, type TransactionReceipt } from 'viem';
import { type LidoSDKCoreProps, type LidoSDKCore } from '../core/index.js';
import { type SDKError } from '../common/utils/index.js';

export type LidoSDKStakingProps = LidoSDKCoreProps & {
  core?: LidoSDKCore;
};

export enum StakeCallbackStages {
  'SIGN' = 'sign',
  'RECEIPT' = 'receipt',
  'CONFIRMATION' = 'confirmation',
  'DONE' = 'done',
  'MULTISIG_DONE' = 'multisig_done',
  'ERROR' = 'error',
}

export type StakeCallbackProps =
  | { stage: StakeCallbackStages.SIGN; payload?: undefined }
  | { stage: StakeCallbackStages.RECEIPT; payload: Hash }
  | { stage: StakeCallbackStages.CONFIRMATION; payload: TransactionReceipt }
  | { stage: StakeCallbackStages.DONE; payload: bigint }
  | { stage: StakeCallbackStages.MULTISIG_DONE; payload?: undefined }
  | { stage: StakeCallbackStages.ERROR; payload: SDKError };

export type StakeStageCallback = (props: StakeCallbackProps) => void;

export type StakeProps = {
  value: string;
  account: Address;
  callback?: StakeStageCallback;
  referralAddress?: Address;
};

export type StakeResult = {
  hash: Hash;
  receipt?: TransactionReceipt;
  confirmations?: bigint;
};

export type StakeEncodeDataProps = {
  referralAddress?: Address;
};

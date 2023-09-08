import { type Address, type Hash, type TransactionReceipt } from 'viem';

import { type LidoSDKCoreProps, type LidoSDKCore } from '../core/index.js';
import { type SDKError } from '../common/utils/index.js';
import { LIDO_TOKENS } from '../common/constants.js';

export type LidoSDKWithdrawalsProps = LidoSDKCoreProps & {
  core?: LidoSDKCore;
};

export type WithdrawableTokens =
  | (typeof LIDO_TOKENS)['steth']
  | (typeof LIDO_TOKENS)['wsteth'];

export type RequestStatus = {
  amountOfStETH: bigint;
  amountOfShares: bigint;
  owner: Address;
  timestamp: bigint;
  isFinalized: boolean;
  isClaimed: boolean;
};

export type RequestStatusWithId = {
  amountOfStETH: bigint;
  amountOfShares: bigint;
  owner: Address;
  timestamp: bigint;
  isFinalized: boolean;
  isClaimed: boolean;
  id: bigint;
  stringId: string;
};

export type PermitWstETHStETHProps = {
  amount: bigint;
  account: Address;
  spender: Address;
  deadline: bigint;
};

export type PermitProps = PermitWstETHStETHProps & {
  token: WithdrawableTokens;
};

export type RequestWithPermitProps = {
  account: Address;
  amount: string;
  requests: readonly bigint[];
  token: WithdrawableTokens;
  callback?: RequestStageCallback;
};

export type RequestProps = {
  account: Address;
  requests: readonly bigint[];
  token: WithdrawableTokens;
  callback?: RequestStageCallback;
};

export enum RequestCallbackStages {
  'BUNKER' = 'bunker',
  'PERMIT' = 'permit',
  'GAS_LIMIT' = 'gas_limit',
  'SIGN' = 'sign',
  'RECEIPT' = 'receipt',
  'CONFIRMATION' = 'confirmation',
  'DONE' = 'done',
  'MULTISIG_DONE' = 'multisig_done',
  'ERROR' = 'error',
}

export type RequestCallbackProps =
  | { stage: RequestCallbackStages.BUNKER; payload?: undefined }
  | { stage: RequestCallbackStages.PERMIT; payload?: undefined }
  | { stage: RequestCallbackStages.GAS_LIMIT; payload?: undefined }
  | { stage: RequestCallbackStages.SIGN; payload?: bigint }
  | { stage: RequestCallbackStages.RECEIPT; payload: Hash }
  | { stage: RequestCallbackStages.CONFIRMATION; payload: TransactionReceipt }
  | { stage: RequestCallbackStages.DONE; payload: bigint }
  | { stage: RequestCallbackStages.MULTISIG_DONE; payload?: undefined }
  | { stage: RequestCallbackStages.ERROR; payload: SDKError };

export type RequestStageCallback = (props: RequestCallbackProps) => void;

export enum ApproveCallbackStages {
  'GAS_LIMIT' = 'gas_limit',
  'SIGN' = 'sign',
  'RECEIPT' = 'receipt',
  'CONFIRMATION' = 'confirmation',
  'DONE' = 'done',
  'MULTISIG_DONE' = 'multisig_done',
  'ERROR' = 'error',
}

export type ApproveCallbackProps =
  | { stage: ApproveCallbackStages.GAS_LIMIT; payload?: undefined }
  | { stage: ApproveCallbackStages.SIGN; payload?: bigint }
  | { stage: ApproveCallbackStages.SIGN; payload: Hash }
  | { stage: ApproveCallbackStages.RECEIPT; payload: Hash }
  | {
      stage: ApproveCallbackStages.CONFIRMATION;
      payload: TransactionReceipt;
    }
  | { stage: ApproveCallbackStages.DONE; payload: bigint }
  | { stage: ApproveCallbackStages.MULTISIG_DONE; payload?: undefined }
  | { stage: ApproveCallbackStages.ERROR; payload: SDKError };

export type ApproveStageCallback = (props: ApproveCallbackProps) => void;

export type ApproveProps = {
  account: Address;
  amount: string;
  token: 'stETH' | 'wstETH';
  callback?: ApproveStageCallback;
};

import { type Address, type Hash, type TransactionReceipt } from 'viem';

import { type LidoSDKCoreProps, type LidoSDKCore } from '../core/index.js';
import { type SDKError } from '../common/utils/index.js';

import { type LidoSDKWithdrawalsContract } from './withdrawalsContract.js';
import { type LidoSDKWithdrawalsViews } from './withdrawalsViews.js';

export type LidoSDKWithdrawalsProps = LidoSDKCoreProps & {
  core?: LidoSDKCore;
};

export type LidoSDKWithdrawalsContractProps = LidoSDKCoreProps & {
  core?: LidoSDKCore;
};

export type LidoSDKWithdrawalsViewsProps = LidoSDKCoreProps & {
  core?: LidoSDKCore;
  contract?: LidoSDKWithdrawalsContract;
};

export type LidoSDKWithdrawalsRequestsInfoProps = LidoSDKCoreProps & {
  core?: LidoSDKCore;
  views?: LidoSDKWithdrawalsViews;
};

export type LidoSDKWithdrawalsPermitProps = LidoSDKCoreProps & {
  core?: LidoSDKCore;
  contract?: LidoSDKWithdrawalsContract;
};

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
  contract: 'stETH' | 'wstETH';
};

export type RequestWithPermitProps = {
  account: Address;
  amount: string;
  requests: readonly bigint[];
  contract: 'stETH' | 'wstETH';
  callback?: RequestStageCallback;
};

export enum RequestCallbackStage {
  'BUNKER' = 'bunker',
  'PERMIT' = 'permit',
  'APPROVE' = 'approve',
  'SIGN' = 'sign',
  'RECEIPT' = 'receipt',
  'CONFIRMATION' = 'confirmation',
  'DONE' = 'done',
  'MULTISIG_DONE' = 'multisig_done',
  'ERROR' = 'error',
}

export type RequestCallbackProps =
  | { stage: RequestCallbackStage.BUNKER; payload?: undefined }
  | { stage: RequestCallbackStage.PERMIT; payload?: undefined }
  | { stage: RequestCallbackStage.APPROVE; payload?: undefined }
  | { stage: RequestCallbackStage.SIGN; payload?: undefined }
  | { stage: RequestCallbackStage.RECEIPT; payload: Hash }
  | { stage: RequestCallbackStage.CONFIRMATION; payload: TransactionReceipt }
  | { stage: RequestCallbackStage.DONE; payload: bigint }
  | { stage: RequestCallbackStage.MULTISIG_DONE; payload?: undefined }
  | { stage: RequestCallbackStage.ERROR; payload: SDKError };

export type RequestStageCallback = (props: RequestCallbackProps) => void;

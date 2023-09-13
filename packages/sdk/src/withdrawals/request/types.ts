import { type Address, type Hash, type TransactionReceipt } from 'viem';

import { EtherValue, TransactionCallback } from '../../core/index.js';
import { type SDKError } from '../../common/utils/index.js';
import { LIDO_TOKENS } from '../../common/constants.js';

export type WithdrawableTokens =
  | (typeof LIDO_TOKENS)['steth']
  | (typeof LIDO_TOKENS)['wsteth'];

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
  requests: readonly bigint[];
  token: WithdrawableTokens;
  callback?: TransactionCallback;
};

export type RequestProps = {
  account: Address;
  requests: readonly bigint[];
  token: WithdrawableTokens;
  callback?: TransactionCallback;
};

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
  amount: EtherValue;
  token: 'stETH' | 'wstETH';
  callback?: ApproveStageCallback;
};

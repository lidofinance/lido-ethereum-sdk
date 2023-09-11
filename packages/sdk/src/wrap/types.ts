import {
  FormattedTransactionRequest,
  type Address,
  type Hash,
  type TransactionReceipt,
} from 'viem';
import LidoSDKCore from '../core/core.js';
import {
  LidoSDKCoreProps,
  TransactionCallback,
  TransactionCallbackStage,
} from '../core/types.js';
import { SDKError } from '../common/utils/SDKError.js';

export type LidoSDKWrapProps = LidoSDKCoreProps & {
  core?: LidoSDKCore;
};

export type WrapProps = {
  value: string;
  account: Address;
  callback?: TransactionCallback;
};

export type TxResult = {
  hash: Hash;
  receipt?: TransactionReceipt;
  confirmations?: bigint;
};

export type PopulatedTx = Omit<FormattedTransactionRequest, 'type'>;

export interface TxMethodProps {
  account: Address;
  callback?: (props: {
    stage: TransactionCallbackStage.ERROR;
    payload: SDKError;
  }) => void;
}

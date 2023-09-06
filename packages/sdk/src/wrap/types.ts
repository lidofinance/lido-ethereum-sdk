import {
  FormattedTransactionRequest,
  type Address,
  type Hash,
  type TransactionReceipt,
} from 'viem';
import LidoSDKCore from '../core/core.js';
import { LidoSDKCoreProps, TransactionCallback } from '../core/types.js';

export type LidoSDKWrapProps = LidoSDKCoreProps & {
  core?: LidoSDKCore;
};

export type CommonWrapProps = {
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

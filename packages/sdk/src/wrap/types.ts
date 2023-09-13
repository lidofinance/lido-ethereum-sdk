import {
  FormattedTransactionRequest,
  type Address,
  type Hash,
  type TransactionReceipt,
} from 'viem';
import LidoSDKCore from '../core/core.js';
import {
  type EtherValue,
  type LidoSDKCoreProps,
  type TransactionCallback,
} from '../core/types.js';

export type LidoSDKWrapProps = LidoSDKCoreProps & {
  core?: LidoSDKCore;
};

export type WrapProps = {
  value: EtherValue;
  account: Address;
  callback?: TransactionCallback;
};

export type WrapPropsWithoutCallback = Omit<WrapProps, 'callback'>;

export type WrapInnerProps = {
  value: bigint;
  account: Address;
  callback: TransactionCallback;
};

export type TxResult = {
  hash: Hash;
  receipt?: TransactionReceipt;
  confirmations?: bigint;
};

export type PopulatedTx = Omit<FormattedTransactionRequest, 'type'>;

export interface TxMethodProps {
  account: Address;
}

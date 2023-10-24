import { FormattedTransactionRequest, type Address } from 'viem';
import {
  type LidoSDKCommonProps,
  type EtherValue,
  type TransactionCallback,
} from '../core/types.js';

export type LidoSDKWrapProps = LidoSDKCommonProps;

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

export type PopulatedTx = Omit<FormattedTransactionRequest, 'type'>;

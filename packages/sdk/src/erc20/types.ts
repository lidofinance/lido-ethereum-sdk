import { Address } from 'viem';
import {
  type LidoSDKCoreProps,
  type LidoSDKCore,
  type TransactionCallback,
  type EtherValue,
} from '../core/index.js';

export type LidoSDKErc20Props = LidoSDKCoreProps & {
  core?: LidoSDKCore;
};

export type TransactionProps = {
  account: Address;
  callback?: TransactionCallback;
};

export type InnerTransactionProps = Required<TransactionProps>;

export type ParsedTransactionProps<TProps extends TransactionProps> = Omit<
  TProps,
  'callback'
> & {
  callback: NonNullable<TProps['callback']>;
} & (TProps extends { amount: EtherValue } ? { amount: bigint } : {});

export type TransferProps = {
  amount: EtherValue;
  to: Address;
  from?: Address;
} & TransactionProps;

export type ApproveProps = {
  amount: EtherValue;
  to: Address;
} & TransactionProps;

export type AllowanceProps = {
  account: Address;
  to: Address;
};

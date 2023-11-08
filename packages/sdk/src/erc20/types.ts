import { Address } from 'viem';
import {
  type LidoSDKCoreProps,
  type LidoSDKCore,
  type TransactionCallback,
  type EtherValue,
} from '../core/index.js';
import { CommonTransactionProps, SignPermitProps } from '../core/types.js';

export type LidoSDKErc20Props = LidoSDKCoreProps & {
  core?: LidoSDKCore;
};

export type TransactionProps = {
  account: Address;
  callback?: TransactionCallback;
};

export type InnerTransactionProps = Required<CommonTransactionProps>;

export type ParsedTransactionProps<TProps extends CommonTransactionProps> =
  Omit<TProps, 'callback'> & {
    callback: NonNullable<TProps['callback']>;
  } & (TProps extends { amount: EtherValue } ? { amount: bigint } : {});

export type TransferProps = {
  amount: EtherValue;
  to: Address;
  from?: Address;
} & CommonTransactionProps;

export type ApproveProps = {
  amount: EtherValue;
  to: Address;
} & CommonTransactionProps;

export type AllowanceProps = {
  account: Address;
  to: Address;
};

export type SignTokenPermitProps = Omit<SignPermitProps, 'token'>;

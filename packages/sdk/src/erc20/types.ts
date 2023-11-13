import type { Address } from 'viem';
import type {
  TransactionCallback,
  EtherValue,
  CommonTransactionProps,
  LidoSDKCommonProps,
  SignPermitProps,
} from '../core/types.js';

export type LidoSDKErc20Props = LidoSDKCommonProps;

export type TransactionProps = {
  account: Address;
  callback?: TransactionCallback;
};

export type InnerTransactionProps = Required<CommonTransactionProps>;

export type ParsedTransactionProps<TProps extends CommonTransactionProps> =
  Omit<TProps, 'callback'> & {
    callback: NonNullable<TProps['callback']>;
  } & (TProps extends { amount: EtherValue } ? { amount: bigint } : object);

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

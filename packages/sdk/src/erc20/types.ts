import type { Address, JsonRpcAccount } from 'viem';
import { type EtherValue } from '../core/index.js';
import {
  AccountValue,
  CommonTransactionProps,
  SignPermitProps,
} from '../core/types.js';

export type InnerTransactionProps = Required<CommonTransactionProps>;

export type ParsedTransactionProps<TProps extends CommonTransactionProps> =
  Omit<TProps, 'callback' | 'account'> & {
    callback: NonNullable<TProps['callback']>;
    account: JsonRpcAccount;
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
  account?: AccountValue;
  to: Address;
};

export type SignTokenPermitProps = Omit<SignPermitProps, 'token'>;

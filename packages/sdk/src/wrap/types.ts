import type { Account, FormattedTransactionRequest } from 'viem';
import type { EtherValue, CommonTransactionProps } from '../core/types.js';

export type WrapProps = CommonTransactionProps & {
  value: EtherValue;
};

export type WrapResults = {
  stethWrapped: bigint;
  wstethReceived: bigint;
};

export type WrapPropsWithoutCallback = Omit<WrapProps, 'callback'>;

export type WrapInnerProps = Omit<CommonTransactionProps, 'account'> & {
  value: bigint;
  account: Account;
};

export type PopulatedTx = Omit<FormattedTransactionRequest, 'type'>;

import type { Address } from 'viem';
import type { CommonTransactionProps, EtherValue } from '../core/types.js';
import type { FormattedTransactionRequest, JsonRpcAccount } from 'viem';

export type SharesTransferProps = CommonTransactionProps & {
  from?: Address;
  to: Address;
  amount: EtherValue;
};

export type WrapProps = CommonTransactionProps & {
  value: EtherValue;
};

export type WrapResults = {
  stethReceived: bigint;
  wstethWrapped: bigint;
};

export type UnwrapResults = {
  stethUnwrapped: bigint;
  wstethReceived: bigint;
};

export type WrapPropsWithoutCallback = Omit<WrapProps, 'callback'>;

export type WrapInnerProps = Omit<CommonTransactionProps, 'account'> & {
  value: bigint;
  account: JsonRpcAccount;
};

export type PopulatedTx = Omit<FormattedTransactionRequest, 'type'>;

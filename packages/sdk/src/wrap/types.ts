import type { FormattedTransactionRequest, JsonRpcAccount, Address } from 'viem';
import type { EtherValue, CommonTransactionProps } from '../core/types.js';

export type WrapProps = CommonTransactionProps & {
  value: EtherValue;
  referralAddress?: Address;
};

export type WrapResults = {
  stethWrapped: bigint;
  wstethReceived: bigint;
};

export type UnwrapResults = {
  wstethUnwrapped: bigint;
  stethReceived: bigint;
};

export type WrapPropsWithoutCallback = Omit<WrapProps, 'callback'>;

export type WrapInnerProps = Omit<CommonTransactionProps, 'account'> & {
  value: bigint;
  account: JsonRpcAccount;
  referralAddress: Address;
};

export type PopulatedTx = Omit<FormattedTransactionRequest, 'type'>;

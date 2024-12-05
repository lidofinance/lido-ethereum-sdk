import type { Address } from 'viem';
import type {
  CommonTransactionProps,
  EtherValue,
  NoTxOptions,
} from '../core/types.js';
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

export type WrapPropsWithoutTxOptions = NoTxOptions<WrapProps>;

export type WrapInnerProps = Omit<CommonTransactionProps, 'account'> & {
  value: bigint;
  account: JsonRpcAccount;
};

export type PopulatedTx = Omit<FormattedTransactionRequest, 'type'>;

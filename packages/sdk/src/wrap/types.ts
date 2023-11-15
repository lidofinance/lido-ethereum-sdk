import type { FormattedTransactionRequest } from 'viem';
import type { EtherValue, CommonTransactionProps } from '../core/types.js';

export type WrapProps = CommonTransactionProps & {
  value: EtherValue;
};

export type WrapPropsWithoutCallback = Omit<WrapProps, 'callback'>;

export type WrapInnerProps = CommonTransactionProps & {
  value: bigint;
};

export type PopulatedTx = Omit<FormattedTransactionRequest, 'type'>;

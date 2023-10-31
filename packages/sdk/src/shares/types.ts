import type { Address } from 'viem';
import type {
  EtherValue,
  LidoSDKCommonProps,
  TransactionCallback,
} from '../core/types.js';

export type LidoSDKSharesProps = LidoSDKCommonProps;

export type SharesTransferProps = {
  account: Address;
  from?: Address;
  to: Address;
  amount: EtherValue;
  callback?: TransactionCallback;
};

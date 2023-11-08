import type { Address } from 'viem';
import type {
  CommonTransactionProps,
  EtherValue,
  LidoSDKCommonProps,
} from '../core/types.js';

export type LidoSDKSharesProps = LidoSDKCommonProps;

export type SharesTransferProps = CommonTransactionProps & {
  from?: Address;
  to: Address;
  amount: EtherValue;
};

export type SharesTotalSupplyResult = {
  totalShares: bigint;
  totalEther: bigint;
};

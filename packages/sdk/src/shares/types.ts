import type { Address, GetContractReturnType } from 'viem';
import type {
  CommonTransactionProps,
  EtherValue,
  LidoSdkKeyedClient,
} from '../core/types.js';
import type { EncodableContract } from '../common/index.js';
import type { stethSharesAbiType } from './abi/steth-shares-abi.js';

export type SharesTransferProps = CommonTransactionProps & {
  from?: Address;
  to: Address;
  amount: EtherValue;
};

export type SharesTotalSupplyResult = {
  totalShares: bigint;
  totalEther: bigint;
};

export type SharesAmountWithRoundUp = {
  amount: EtherValue;
  roundUp?: boolean;
};

export type BatchSharesToStethValue = EtherValue | SharesAmountWithRoundUp;

export type StethShareContractType = EncodableContract<
  GetContractReturnType<stethSharesAbiType, LidoSdkKeyedClient>
>;

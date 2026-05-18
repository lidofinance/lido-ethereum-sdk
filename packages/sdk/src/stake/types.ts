import type { Address, GetContractReturnType, JsonRpcAccount } from 'viem';
import type {
  CommonTransactionProps,
  LidoSdkKeyedClient,
} from '../core/types.js';
import type { EtherValue } from '../core/types.js';
import type { EncodableContract } from '../common/index.js';
import type { StethAbiType } from './abi/steth.js';

export type StakeProps = CommonTransactionProps & {
  value: EtherValue;
  referralAddress?: Address;
};

export type StakeInnerProps = Omit<CommonTransactionProps, 'account'> & {
  value: bigint;
  referralAddress: Address;
  account: JsonRpcAccount;
};

export type StakeResult = {
  stethReceived: bigint;
  sharesReceived: bigint;
};

export type StakeEncodeDataProps = {
  referralAddress?: Address;
};

export type StakeLimitResult = {
  isStakingPaused: boolean;
  isStakingLimitSet: boolean;
  currentStakeLimit: bigint;
  maxStakeLimit: bigint;
  maxStakeLimitGrowthBlocks: bigint;
  prevStakeLimit: bigint;
  prevStakeBlockNumber: bigint;
};

export type StethContractType = EncodableContract<
  GetContractReturnType<StethAbiType, LidoSdkKeyedClient>
>;

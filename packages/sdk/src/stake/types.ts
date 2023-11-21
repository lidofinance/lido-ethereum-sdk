import { type Address, type Hash, type TransactionReceipt } from 'viem';
import { CommonTransactionProps } from '../core/types.js';
import { EtherValue } from '../core/types.js';

export type StakeProps = CommonTransactionProps & {
  value: EtherValue;
  referralAddress?: Address;
};

export type StakeInnerProps = CommonTransactionProps & {
  value: bigint;
  referralAddress: Address;
};

export type StakeResult = {
  hash: Hash;
  receipt?: TransactionReceipt;
  confirmations?: bigint;
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

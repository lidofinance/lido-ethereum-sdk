import { type Address, type BlockTag, type Log } from 'viem';
import { type rewardsEventsAbi } from './abi/rewardsEvents.js';
import { type LidoSDKCommonProps } from '../core/types.js';

export type NonPendingBlockTag = Exclude<BlockTag, 'pending'>;

export type LidoSDKRewardsProps = LidoSDKCommonProps;

export type GetRewardsOptions = {
  address: Address;
  toBlock?: bigint | NonPendingBlockTag;
} & (
  | {
      fromBlock: bigint | NonPendingBlockTag;
    }
  | {
      fromBlock?: undefined;
      blocksBack: bigint;
    }
);

export type RewardsEvents =
  | Log<
      bigint,
      number,
      false,
      undefined,
      true,
      typeof rewardsEventsAbi,
      'TransferShares'
    >
  | Log<
      bigint,
      number,
      false,
      undefined,
      true,
      typeof rewardsEventsAbi,
      'TokenRebased'
    >;

export type RewardType =
  | 'submit'
  | 'withdrawal'
  | 'rebase'
  | 'transfer_in'
  | 'transfer_out';

export type Reward = {
  type: RewardType;
  change: bigint;
  changeShares: bigint;
  balance: bigint;
  balanceShares: bigint;
  shareRate: number;
  originalEvent: RewardsEvents;
};

export type GetRewardsResult = {
  rewards: Reward[];
  baseBalance: bigint;
  baseBalanceShares: bigint;
  baseShareRate: number;
  fromBlock: bigint;
  toBlock: bigint;
};

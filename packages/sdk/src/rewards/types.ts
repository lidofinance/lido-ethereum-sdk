import { type Address, type BlockTag, type Log } from 'viem';
import { type rewardsEventsAbi } from './abi/rewardsEvents.js';
import { type LidoSDKCommonProps } from '../core/types.js';
import { TotalRewardEntity, TransferEventEntity } from './subgraph/types.js';

export type NonPendingBlockTag = Exclude<BlockTag, 'pending'>;

export type LidoSDKRewardsProps = LidoSDKCommonProps;

export type GetRewardsOptions = {
  address: Address;
  includeZeroRebases?: boolean;
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

export type RewardsChainEvents =
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

export type RewardsSubgraphEvents = TransferEventEntity | TotalRewardEntity;

export type RewardType =
  | 'submit'
  | 'withdrawal'
  | 'rebase'
  | 'transfer_in'
  | 'transfer_out';

export type Reward<TEvent> = {
  type: RewardType;
  change: bigint;
  changeShares: bigint;
  balance: bigint;
  balanceShares: bigint;
  shareRate: number;
  originalEvent: TEvent;
};

type GetRewardsCommonResult = {
  baseBalance: bigint;
  baseBalanceShares: bigint;
  baseShareRate: number;
  fromBlock: bigint;
  toBlock: bigint;
};

export type GetRewardsFromSubgraphOptions = GetRewardsOptions & {
  getSubgraphUrl: (id: string, chainId: number) => string;
  step?: number;
};

export type GetRewardsFromSubgraphResults = {
  rewards: Reward<RewardsSubgraphEvents>[];
  lastIndexedBlock: bigint;
} & GetRewardsCommonResult;

export type GetRewardsFromChainOptions = GetRewardsOptions;

export type GetRewardsFromChainResults = {
  rewards: Reward<RewardsChainEvents>[];
} & GetRewardsCommonResult;

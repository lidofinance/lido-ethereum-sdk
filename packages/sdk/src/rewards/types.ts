import { type Address, type BlockTag, type Log } from 'viem';
import { type rewardsEventsAbi } from './abi/rewardsEvents.js';
import { type LidoSDKCommonProps } from '../core/types.js';
import type {
  TotalRewardEntity,
  TransferEventEntity,
} from './subgraph/types.js';

export type NonPendingBlockTag = Exclude<BlockTag, 'pending'>;

export type LidoSDKRewardsProps = LidoSDKCommonProps;

export type BlockArgumentType =
  | {
      block: bigint | NonPendingBlockTag;
      timestamp?: undefined;
    }
  | {
      block?: undefined;
      timestamp: bigint;
    };

export type BackArgumentType =
  | {
      seconds: bigint;
      days?: undefined;
      blocks?: undefined;
    }
  | {
      seconds?: undefined;
      days: bigint;
      blocks?: undefined;
    }
  | {
      days?: undefined;
      seconds?: undefined;
      blocks: bigint;
    };

export type GetRewardsOptions = {
  address: Address;
  includeZeroRebases?: boolean;
  includeOnlyRebases?: boolean;
  to?: BlockArgumentType;
  step?: number;
} & (
  | {
      from: BlockArgumentType;
      back?: undefined;
    }
  | {
      back: BackArgumentType;
      from?: undefined;
    }
);

export type RewardChainEventTransfer = Log<
  bigint,
  number,
  false,
  undefined,
  true,
  typeof rewardsEventsAbi,
  'TransferShares'
>;

export type RewardChainEventRebase = Log<
  bigint,
  number,
  false,
  undefined,
  true,
  typeof rewardsEventsAbi,
  'TokenRebased'
>;

export type RewardsChainEvents =
  | RewardChainEventTransfer
  | RewardChainEventRebase;

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
  totalRewards: bigint;
  fromBlock: bigint;
  toBlock: bigint;
};

export type GetRewardsFromSubgraphOptions = GetRewardsOptions & {
  getSubgraphUrl: (id: string, chainId: number) => string;
};

export type GetRewardsFromSubgraphResult = {
  rewards: Reward<RewardsSubgraphEvents>[];
  lastIndexedBlock: bigint;
} & GetRewardsCommonResult;

export type GetRewardsFromChainOptions = GetRewardsOptions;

export type GetRewardsFromChainResult = {
  rewards: Reward<RewardsChainEvents>[];
} & GetRewardsCommonResult;

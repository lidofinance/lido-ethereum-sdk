import type { Address, Log } from 'viem';
import type { rewardsEventsAbi } from './abi/rewardsEvents.js';
import type { BackArgumentType, BlockArgumentType } from '../core/types.js';
import type {
  TotalRewardEntity,
  TransferEventEntity,
} from './subgraph/types.js';

export type GetRewardsOptions = {
  address: Address;
  includeZeroRebases?: boolean;
  includeOnlyRebases?: boolean;
  to?: BlockArgumentType;
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
  apr?: number;
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
  stepEntities?: number;
  getSubgraphUrl: (id: string | null, chainId: number) => string;
};

export type GetRewardsFromSubgraphResult = {
  rewards: Reward<RewardsSubgraphEvents>[];
  lastIndexedBlock: bigint;
} & GetRewardsCommonResult;

export type GetRewardsFromChainOptions = GetRewardsOptions & {
  stepBlock?: number;
};

export type GetRewardsFromChainResult = {
  rewards: Reward<RewardsChainEvents>[];
} & GetRewardsCommonResult;

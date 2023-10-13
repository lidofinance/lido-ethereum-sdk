// Base entities

export type TransferEventEntity = {
  from: string;
  to: string;
  value: string;

  shares: string;
  sharesBeforeDecrease: string;
  sharesAfterDecrease: string;
  sharesBeforeIncrease: string;
  sharesAfterIncrease: string;

  totalPooledEther: string;
  totalShares: string;

  balanceAfterDecrease: string;
  balanceAfterIncrease: string;

  block: string;
  blockTime: string;
  transactionHash: string;
  transactionIndex: string;
  logIndex: string;
};

export type TotalRewardEntity = {
  id: string;

  totalPooledEtherBefore: string;
  totalPooledEtherAfter: string;
  totalSharesBefore: string;
  totalSharesAfter: string;

  apr: string;

  block: string;
  blockTime: string;
  logIndex: string;
};

// Queries

export type LidoTransfersQueryResult = {
  lidoTransfers: TransferEventEntity[];
};
export type TotalRewardsQueryResult = { totalRewards: TotalRewardEntity[] };

export type LidoTransfersQueryVariablesNoPagination = {
  address: string;
};

export type StatusQueryResult = {
  _meta: {
    block: {
      number: number;
      hash: string;
    };
  };
};

export type InitialDataQueryVariables = {
  address: string;
  block: number;
};

export type InitialDataQueryResult = {
  lidoTransfers: TransferEventEntity[];
  totalRewards: TotalRewardEntity[];
};

// Requests

export type SubgraphRequestOptions = {
  url: string;
  step: number;
  fromBlock: bigint;
  toBlock: bigint;
};

// last indexed

export type GetLastIndexedBlockOptions = Pick<SubgraphRequestOptions, 'url'>;

export type GetLastIndexedBlockResult = StatusQueryResult['_meta']['block'];

// last transfer

export type GetInitialDataOptions = {
  address: string;
  block: bigint;
  url: string;
};

export type GetInitialDataResult = {
  transfer: TransferEventEntity | null;
  rebase: TotalRewardEntity | null;
};

// get transfers

export type GetTransfersOptions = SubgraphRequestOptions & {
  address: string;
};

export type GetTransfersResult = TransferEventEntity[];

// get rewards

export type GetTotalRewardsOptions = SubgraphRequestOptions;

export type GetTotalRewardsResult = TotalRewardEntity[];

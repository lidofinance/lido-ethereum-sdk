import { request } from 'graphql-request';
import {
  StatusQuery,
  LidoTransfersQuery,
  TotalRewardsQuery,
  InitialStateQuery,
} from './queries.js';
import {
  type SubgraphRequestOptions,
  type GetLastIndexedBlockOptions,
  type StatusQueryResult,
  type GetTransfersOptions,
  type TransferEventEntity,
  type LidoTransfersQueryVariablesNoPagination,
  type GetTotalRewardsOptions,
  type TotalRewardEntity,
  type GetTotalRewardsResult,
  type GetTransfersResult,
  type LidoTransfersQueryResult,
  type TotalRewardsQueryResult,
  type GetInitialDataOptions,
  type GetInitialDataResult,
  type InitialDataQueryVariables,
  type InitialDataQueryResult,
} from './types.js';

const requestAllWithStep = async <TResult, TResultEntry, TVariables>({
  url,
  step,
  document,
  variables,
  fromBlock,
  toBlock,
  extractArray,
}: {
  variables: TVariables;
  document: any;
  extractArray: (result: TResult | null) => TResultEntry[];
} & SubgraphRequestOptions): Promise<Array<TResultEntry>> => {
  let skip = 0;
  const results: TResultEntry[] = [];
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const partialResult = await request<TResult>({
      url,
      document,
      variables: {
        ...variables,
        first: step,
        skip,
        fromBlock: Number(fromBlock),
        toBlock: Number(toBlock),
      },
    });
    const array = extractArray(partialResult);
    results.push(...array);
    // break if we don't fetch more than step
    if (array.length < step) break;
    skip += step;
  }
  return results;
};

export const getLastIndexedBlock = async ({
  url,
}: GetLastIndexedBlockOptions): Promise<
  StatusQueryResult['_meta']['block']
> => {
  return (await request<StatusQueryResult>({ url, document: StatusQuery }))
    ._meta.block;
};

export const getInitialData = async ({
  url,
  address,
  block,
}: GetInitialDataOptions): Promise<GetInitialDataResult> => {
  const { lidoTransfers, totalRewards } = await request<
    InitialDataQueryResult,
    InitialDataQueryVariables
  >({
    document: InitialStateQuery,
    url,
    variables: { address, block: Number(block) },
  });
  return {
    transfer: lidoTransfers.length > 0 ? lidoTransfers?.[0] ?? null : null,
    rebase: totalRewards.length > 0 ? totalRewards?.[0] ?? null : null,
  };
};

export const getTransfers = async ({
  url,
  address,
  fromBlock,
  toBlock,
  step,
}: GetTransfersOptions): Promise<GetTransfersResult> => {
  return requestAllWithStep<
    LidoTransfersQueryResult,
    TransferEventEntity,
    LidoTransfersQueryVariablesNoPagination
  >({
    url,
    document: LidoTransfersQuery,
    step,
    fromBlock,
    extractArray: (result) => result?.lidoTransfers ?? [],
    toBlock,
    variables: {
      address,
    },
  });
};

export const getTotalRewards = async ({
  url,
  fromBlock,
  step,
  toBlock,
}: GetTotalRewardsOptions): Promise<GetTotalRewardsResult> => {
  return requestAllWithStep<TotalRewardsQueryResult, TotalRewardEntity, object>(
    {
      url,
      document: TotalRewardsQuery,
      step,
      extractArray: (result) => result?.totalRewards ?? [],
      fromBlock,
      toBlock,
      variables: {},
    },
  );
};

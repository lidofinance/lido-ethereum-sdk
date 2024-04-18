import { expect } from '@jest/globals';
import {
  GetRewardsFromChainOptions,
  GetRewardsFromChainResult,
  GetRewardsFromSubgraphResult,
  LidoSDKRewards,
  invariant,
} from '../../../src/index.js';
import { useTestsEnvs } from '../fixtures/use-test-envs.js';
import {
  expectAlmostEqualBn,
  expectNonNegativeBn,
  expectPositiveBn,
} from './expect-bn.js';

export type RewardsSnapshotType = {
  chain: number;
  params: GetRewardsFromChainOptions;
};

export const expectRewardsSnapshot = async (
  { chain, params }: RewardsSnapshotType,
  sdk: LidoSDKRewards,
) => {
  const { chainId, subgraphUrl } = useTestsEnvs();
  expect(chainId).toBe(chain);
  const chainRewards = await sdk.getRewardsFromChain(params);
  expectRewardsResult(chainRewards, params);

  // filter out native events objs
  // because some ETH clients can eject extra properties
  chainRewards.rewards.forEach((reward) => {
    delete (reward as any).originalEvent;
  });
  expect(chainRewards).toMatchSnapshot('-chain');

  if (subgraphUrl) {
    const subgraphRewards = await sdk.getRewardsFromSubgraph({
      ...params,
      getSubgraphUrl: () => ({
        url: subgraphUrl,
      }),
    });
    expectRewardsResult(subgraphRewards, params);
    expect(subgraphRewards).toMatchSnapshot(
      {
        lastIndexedBlock: expect.any(BigInt),
      },
      '--graph',
    );

    // match for common initial values
    expect({
      ...subgraphRewards,
      lastIndexedBlock: null,
      rewards: null,
    }).toEqual({
      ...chainRewards,
      rewards: null,
      lastIndexedBlock: null,
    });

    // match rewards
    for (let index = 0; index < subgraphRewards.rewards.length; index++) {
      const subgraphReward = subgraphRewards.rewards[index];
      const chainReward = chainRewards.rewards[index];

      invariant(subgraphReward, 'must have reward');
      invariant(chainReward, 'must have reward');

      expect({
        ...subgraphReward,
        apr: null,
        change: null,
        originalEvent: null,
      }).toEqual({
        ...chainReward,
        apr: null,
        change: null,
        originalEvent: null,
      });
      expectAlmostEqualBn(subgraphReward.change, chainReward.change);
      if (subgraphReward?.type === 'rebase') {
        invariant(subgraphReward.apr, 'must have apr');
        invariant(chainReward.apr, 'must have apr');
        expect(subgraphReward.apr).toBeCloseTo(chainReward.apr);
      }
    }
  }
};

// eslint-disable-next-line func-style
function isSubgraphResult(
  result: GetRewardsFromChainResult | GetRewardsFromSubgraphResult,
): result is GetRewardsFromSubgraphResult {
  return 'lastIndexedBlock' in result;
}

export const expectRewardsResult = (
  result: GetRewardsFromChainResult | GetRewardsFromSubgraphResult,
  params: GetRewardsFromChainOptions,
) => {
  const isSubgraph = isSubgraphResult(result);
  expectNonNegativeBn(result.baseBalance);
  expectNonNegativeBn(result.baseBalanceShares);
  expectNonNegativeBn(result.totalRewards);
  expectPositiveBn(result.fromBlock);
  expectPositiveBn(result.toBlock);
  expect(result.baseShareRate).toBeGreaterThan(0);
  if (isSubgraph) {
    expectPositiveBn(result.lastIndexedBlock);
  }

  let rewardsSum = 0n;
  for (const reward of result.rewards) {
    expect(reward.type).toMatch(
      /^((submit)|(withdrawal)|(rebase)|(transfer_in)|(transfer_out))$/,
    );
    if (params.includeOnlyRebases) {
      expect(reward.type).toBe('rebase');
    }
    if (params.includeZeroRebases === false && reward.type === 'rebase') {
      expectPositiveBn(reward.change);
    }
    if (reward.type === 'rebase') {
      rewardsSum += reward.change;
      expect(reward.changeShares).toBe(0n);
      expect(reward.apr).toBeGreaterThan(0);
    }
    expectNonNegativeBn(reward.balance);
    expectNonNegativeBn(reward.balanceShares);
    expectNonNegativeBn(reward.change);
    expectNonNegativeBn(reward.changeShares);
    expect(reward.shareRate).toBeGreaterThan(0);
    expectNonNegativeBn(reward.changeShares);
    expect(reward.originalEvent).toBeDefined();
  }
  expect(rewardsSum).toBe(result.totalRewards);
};

/* eslint-disable jest/no-conditional-expect */
import { describe, test } from '@jest/globals';
import { expectSDKModule } from '../../../tests/utils/expect/expect-sdk-module.js';
import { LidoSDKRewards } from '../../index.js';

import { useRewards } from '../../../tests/utils/fixtures/use-rewards.js';
import { useAccount } from '../../../tests/utils/fixtures/use-wallet-client.js';

import {
  RewardsSnapshotType,
  expectRewardsResult,
  expectRewardsSnapshot,
} from '../../../tests/utils/expect/expect-rewards-snapshot.js';

const HOODI = 560048;
const REWARDS_ADDRESS = '0x386BB4957595Df94c8F44A4f8fF99c9fef57017f';

const REWARDS_SNAPSHOTS_PARAMS: RewardsSnapshotType[] = [
  {
    chain: HOODI,
    params: {
      address: REWARDS_ADDRESS,
      from: { block: 452867n },
      to: { block: 454130n },
    },
  },
  {
    chain: HOODI,
    params: {
      address: REWARDS_ADDRESS,
      from: { timestamp: 1701858240n },
      to: { timestamp: 1702048580n },
      includeZeroRebases: false,
    },
  },
  {
    chain: HOODI,
    params: {
      address: REWARDS_ADDRESS,
      back: { blocks: 10000n },
      to: { block: 152174n },
      includeOnlyRebases: false,
    },
  },
  {
    chain: HOODI,
    params: {
      address: REWARDS_ADDRESS,
      back: { blocks: 467245n - 466400n },
      to: { block: 467245n },
      includeOnlyRebases: true,
    },
  },
  {
    chain: HOODI,
    params: {
      address: REWARDS_ADDRESS,
      back: { blocks: 10000n },
      to: { block: 70000n },
      includeZeroRebases: false,
    },
  },
  {
    chain: HOODI,
    params: {
      address: REWARDS_ADDRESS,
      back: { blocks: 10000n },
      to: { block: 70000n },
      includeZeroRebases: true,
    },
  },
];

// TODO
// transfer from Holesky to Mainnet, then unskip

/* eslint-disable jest/no-disabled-tests */
describe.skip('LidoSDKRewards', () => {
  const rewards = useRewards({ useDirectRpc: true });
  const { address } = useAccount();

  test('is proper module', () => {
    expectSDKModule(LidoSDKRewards);
  });

  test('getting rewards from chain works', async () => {
    const result = await rewards.getRewardsFromChain({
      address,
      back: { days: 2n },
    });
    expectRewardsResult(result, { address, back: { days: 2n } });
  });

  test.each(REWARDS_SNAPSHOTS_PARAMS)('rewards snapshot $#', async (params) => {
    await expectRewardsSnapshot(params, rewards);
  });
});

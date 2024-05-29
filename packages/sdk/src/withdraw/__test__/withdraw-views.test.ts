import { expect, describe, test } from '@jest/globals';
import { useWithdraw } from '../../../tests/utils/fixtures/use-withdraw.js';
import {
  expectAlmostEqualBn,
  expectNonNegativeBn,
  expectPositiveBn,
} from '../../../tests/utils/expect/expect-bn.js';
import { parseEther } from 'viem';
import { useWrap } from '../../../tests/utils/fixtures/use-wrap.js';
import { useAccount } from '../../../tests/utils/fixtures/use-wallet-client.js';
import { expectAddress } from '../../../tests/utils/expect/expect-address.js';
import { expectSDKError } from '../../../tests/utils/expect/expect-sdk-error.js';
import { ERROR_CODE } from '../../common/index.js';

describe('withdraw views', () => {
  const withdraw = useWithdraw();
  const wrap = useWrap();
  const { views, contract } = withdraw;
  const { address } = useAccount();

  const requestCount = 10;

  test('has min and max', async () => {
    const [minSteth, maxSteth, minWsteth, maxWsteth] = await Promise.all([
      views.minStethWithdrawalAmount(),
      views.maxStethWithdrawalAmount(),
      views.minWStethWithdrawalAmount(),
      views.maxWStethWithdrawalAmount(),
    ]);
    expectPositiveBn(minSteth);
    expectPositiveBn(maxSteth);
    expectPositiveBn(minWsteth);
    expectPositiveBn(maxWsteth);

    expect(minSteth < maxSteth).toBe(true);
    expect(minWsteth < maxWsteth).toBe(true);
    expect(minWsteth < minSteth).toBe(true);
    expect(maxWsteth < maxSteth).toBe(true);

    expect(minSteth).toBe(100n);
    expect(maxSteth).toBe(parseEther('1000'));

    const convertedMaxSteth = await wrap.convertWstethToSteth(maxWsteth);
    expectAlmostEqualBn(convertedMaxSteth, maxSteth);

    const convertedMinSteth = await wrap.convertWstethToSteth(minWsteth);
    expectAlmostEqualBn(convertedMinSteth, minSteth);
  });

  test('has contract status', async () => {
    const [turbo, paused, bunker] = await Promise.all([
      views.isTurboModeActive(),
      views.isPaused(),
      views.isBunkerModeActive(),
    ]);

    expect(typeof turbo).toBe('boolean');
    expect(typeof paused).toBe('boolean');
    expect(typeof bunker).toBe('boolean');
  });

  test('has unfinalized stETH', async () => {
    const steth = await views.getUnfinalizedStETH();
    expectNonNegativeBn(steth);
  });

  test('has last checkpoint', async () => {
    const checkpoint = await views.getLastCheckpointIndex();
    expectPositiveBn(checkpoint);
  });

  test('has checkpoint hints and claimable ether', async () => {
    const ids = Array.from({ length: requestCount })
      .fill(0n)
      .map((_, index) => BigInt(index + 1));
    const checkpoints = await views.findCheckpointHints({ sortedIds: ids });
    expect(checkpoints).toHaveLength(requestCount);
    for (const checkpoint of checkpoints) {
      expectNonNegativeBn(checkpoint);
    }

    const ethers = await views.getClaimableEther({
      hints: checkpoints,
      sortedIds: ids,
    });
    expect(ethers).toHaveLength(requestCount);
    for (const ether of ethers) {
      expectPositiveBn(ether);
    }
  });

  test('can findCheckpointHints for border requests', async () => {
    const lastFinalizedRequestId = await (
      await contract.getContractWithdrawalQueue()
    ).read.getLastFinalizedRequestId();

    const lastCheckpointIndex = await views.getLastCheckpointIndex();

    const [checkpointFirst, checkpointLast] = await views.findCheckpointHints({
      sortedIds: [1n, lastFinalizedRequestId],
    });

    expect(checkpointFirst).toEqual(1n);
    expect(checkpointLast).toEqual(lastCheckpointIndex);
  });

  test('findCheckpointHints errors for unfinalized requests', async () => {
    const lastFinalizedRequestId = await (
      await contract.getContractWithdrawalQueue()
    ).read.getLastFinalizedRequestId();

    await expectSDKError(async () => {
      await views.findCheckpointHints({
        sortedIds: [lastFinalizedRequestId + 1n],
      });
    }, ERROR_CODE.INVALID_ARGUMENT);
  });

  test('can get withdrawal request ids and statues', async () => {
    const ids = await views.getWithdrawalRequestsIds({ account: address });
    expect(ids.length > 0).toBe(true);
    for (const id of ids) {
      expectPositiveBn(id);
    }
    const statuses = await views.getWithdrawalStatus({ requestsIds: ids });
    expect(statuses).toHaveLength(ids.length);
    for (const status of statuses) {
      expectPositiveBn(status.amountOfShares);
      expectPositiveBn(status.amountOfStETH);
      expect(typeof status.isClaimed).toBe('boolean');
      expect(typeof status.isFinalized).toBe('boolean');
      expectPositiveBn(status.timestamp);
      expectAddress(status.owner, address);
    }
  });
});

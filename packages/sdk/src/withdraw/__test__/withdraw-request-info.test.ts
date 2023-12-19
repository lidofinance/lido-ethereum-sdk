/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { expect, describe, test } from '@jest/globals';
import { useWithdraw } from '../../../tests/utils/fixtures/use-withdraw.js';
import { useUnsteth } from '../../../tests/utils/fixtures/use-unsteth.js';
import { useAccount } from '../../../tests/utils/fixtures/use-wallet-client.js';
import { expectUniqueArray } from '../../../tests/utils/expect/expect-unique-array.js';
import {
  GetClaimableRequestsETHByAccountReturnType,
  GetClaimableRequestsInfoReturnType,
  GetPendingRequestsInfoReturnType,
} from '../types.js';
import { UnstethNFT } from '../../index.js';

describe('withdraw request info', () => {
  const unsteth = useUnsteth();
  const { address } = useAccount();
  const { requestsInfo, claim } = useWithdraw();

  const expectClaimableInfo = (
    claimableInfo: GetClaimableRequestsInfoReturnType,
    nfts: UnstethNFT[],
  ) => {
    let claimableSum = 0n;
    for (const claimable of claimableInfo.claimableRequests) {
      const correspondingNFT = nfts.find((nft) => nft.id === claimable.id);
      expect(correspondingNFT).toBeTruthy();
      expect(claimable).toMatchObject(correspondingNFT!);
      claimableSum += claimable.amountOfStETH;
      expect(claimable.isFinalized).toBe(true);
      expect(claimable.isClaimed).toBe(false);
    }
    expect(claimableSum).toEqual(claimableInfo.claimableAmountStETH);
    expectUniqueArray(claimableInfo.claimableRequests.map((r) => r.id));
  };

  const expectPendingInfo = (
    pendingInfo: GetPendingRequestsInfoReturnType,
    nfts: UnstethNFT[],
  ) => {
    let pendingSum = 0n;
    for (const pending of pendingInfo.pendingRequests) {
      const correspondingNFT = nfts.find((nft) => nft.id === pending.id);
      expect(correspondingNFT).toBeTruthy();
      expect(pending).toMatchObject(correspondingNFT!);
      pendingSum += pending.amountOfStETH;
      expect(pending.isFinalized).toBe(false);
      expect(pending.isClaimed).toBe(false);
    }
    expect(pendingSum).toEqual(pendingInfo.pendingAmountStETH);
    expectUniqueArray(pendingInfo.pendingRequests.map((r) => r.id));
  };

  const expectClaimableETH = async (
    claimableETH: GetClaimableRequestsETHByAccountReturnType,
    claimableInfo: GetClaimableRequestsInfoReturnType,
  ) => {
    const claimableRequestsLength = claimableInfo.claimableRequests.length;
    expect(claimableETH.ethByRequests).toHaveLength(claimableRequestsLength);
    expect(claimableETH.ethByRequests.reduce((a, b) => a + b)).toEqual(
      claimableETH.ethSum,
    );
    expect(claimableETH.hints).toHaveLength(claimableRequestsLength);
    expect(claimableETH.requests).toHaveLength(claimableRequestsLength);
    expect(claimableETH.sortedIds).toHaveLength(claimableRequestsLength);

    expectUniqueArray(claimableETH.sortedIds);
    for (const claimable of claimableETH.requests) {
      const indexInSorted = claimableETH.sortedIds.indexOf(claimable.id);
      expect(indexInSorted >= 0).toBe(true);
      const correspondingInClaimableRequests =
        claimableInfo.claimableRequests.find((req) => req.id === claimable.id);
      expect(claimable).toMatchObject(correspondingInClaimableRequests!);
      expect(claimable.isFinalized).toBe(true);
      expect(claimable.isClaimed).toBe(false);
    }

    await expect(
      claim.claimRequestsSimulateTx({
        requestsIds: claimableETH.sortedIds,
        hints: claimableETH.hints,
      }),
    ).resolves.toBeDefined();
  };

  test('getWithdrawalRequestsInfo', async () => {
    const { claimableETH, claimableInfo, pendingInfo } =
      await requestsInfo.getWithdrawalRequestsInfo({
        account: address,
      });
    const nfts = await unsteth.getNFTsByAccount(address);
    const totalLength =
      pendingInfo.pendingRequests.length +
      claimableInfo.claimableRequests.length;
    expect(totalLength).toEqual(nfts.length);

    expectPendingInfo(pendingInfo, nfts);
    expectClaimableInfo(claimableInfo, nfts);
    await expectClaimableETH(claimableETH, claimableInfo);
  });

  test('getPendingRequestsInfo', async () => {
    const pendingInfo = await requestsInfo.getPendingRequestsInfo({
      account: address,
    });
    const nfts = await unsteth.getNFTsByAccount(address);
    expectPendingInfo(pendingInfo, nfts);
  });

  test('getClaimableRequestsInfo', async () => {
    const claimableInfo = await requestsInfo.getClaimableRequestsInfo({
      account: address,
    });
    const nfts = await unsteth.getNFTsByAccount(address);
    expectClaimableInfo(claimableInfo, nfts);
  });

  test('getClaimableRequestsETHByAccount', async () => {
    const claimableInfo = await requestsInfo.getClaimableRequestsInfo({
      account: address,
    });

    const claimableETH = await requestsInfo.getClaimableRequestsETHByAccount({
      account: address,
    });
    await expectClaimableETH(claimableETH, claimableInfo);
  });

  test('getClaimableRequestsETHByIds', async () => {
    const claimableETH = await requestsInfo.getClaimableRequestsETHByAccount({
      account: address,
    });
    const claimableById = await requestsInfo.getClaimableRequestsETHByIds({
      claimableRequestsIds: claimableETH.sortedIds as bigint[],
    });

    expect(claimableById.ethSum).toEqual(claimableETH.ethSum);
    expect(claimableById.ethByRequests).toEqual(claimableETH.ethByRequests);
    expect(claimableById.hints).toEqual(claimableETH.hints);
  });
});

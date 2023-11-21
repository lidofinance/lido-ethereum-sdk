import { describe, expect, jest } from '@jest/globals';
import { useUnsteth } from '../../../tests/utils/fixtures/use-unsteth.js';
import { expectAddress } from '../../../tests/utils/expect/expect-address.js';
import { expectPositiveBn } from '../../../tests/utils/expect/expect-bn.js';
import { useStake } from '../../../tests/utils/fixtures/use-stake.js';
import { useWithdraw } from '../../../tests/utils/fixtures/use-withdraw.js';
import {
  useAccount,
  useAltAccount,
} from '../../../tests/utils/fixtures/use-wallet-client.js';
import { bigintComparator } from '../../common/utils/bigint-comparator.js';
import {
  SPENDING_TIMEOUT,
  testSpending,
} from '../../../tests/utils/test-spending.js';
import { useRpcCore } from '../../../tests/utils/fixtures/use-core.js';
import { LIDO_CONTRACT_NAMES } from '../../index.js';
import {
  expectPopulatedTx,
  expectPopulatedTxToRun,
} from '../../../tests/utils/expect/expect-populated-tx.js';
import { expectTxCallback } from '../../../tests/utils/expect/expect-tx-callback.js';

describe('unsteth wallet tests', () => {
  const unsteth = useUnsteth();
  const stake = useStake();
  const account = useAccount();
  const core = useRpcCore();
  const altAccount = useAltAccount();
  const withdraw = useWithdraw();
  const value = 100n;
  const nftCount = 5;
  let nftCountBefore = 0;
  let nftIds: bigint[] = [];
  let nftId = 0n;

  jest.setTimeout(SPENDING_TIMEOUT);

  testSpending('stake', async () => {
    const tx = await stake.stakeEth({ value: (value + 2n) * BigInt(nftCount) });
    expectPositiveBn(tx.confirmations);
  });

  testSpending('unstake', async () => {
    const nfts = await unsteth.getNFTsByAccount(account.address);
    nftCountBefore = nfts.length;
    const tx = await withdraw.request.requestWithdrawalWithPermit({
      requests: Array.from<bigint>({ length: nftCount }).fill(value),
      token: 'stETH',
    });
    expectPositiveBn(tx.confirmations);
  });

  testSpending('has nfts', async () => {
    const nfts = await unsteth.getNFTsByAccount(account.address);
    expect(nfts.length).toBe(nftCountBefore + nftCount);
    for (const nft of nfts) {
      expect(nft).toHaveProperty('id');
      expect(nft).toHaveProperty('amountOfShares');
      expect(nft).toHaveProperty('amountOfStETH');
      expect(nft).toHaveProperty('isClaimed');
      expect(nft).toHaveProperty('isFinalized');
      expect(nft).toHaveProperty('owner');
      expect(nft).toHaveProperty('timestamp');

      expectPositiveBn(nft.id);
      expectPositiveBn(nft.amountOfShares);
      expectPositiveBn(nft.amountOfStETH);
      expect(nft.isClaimed).toBe(false);
      expect(typeof nft.isFinalized).toBe('boolean');
      expectPositiveBn(nft.timestamp);
      expectAddress(nft.owner, account.address);
    }
    nftIds = nfts
      .filter((nft) => nft.amountOfStETH == value)
      .map((nft) => nft.id)
      .sort(bigintComparator)
      .slice(-nftCount);
    nftId = nftIds.pop() as bigint;
  });

  testSpending.each(nftIds)('owner is correct for nft $#', async (nftId) => {
    const owner = await unsteth.getAccountByNFT(nftId);
    expectAddress(owner, account.address);
  });

  testSpending('can populate transfer token', async () => {
    const wqAddress = await core.getContractAddress(
      LIDO_CONTRACT_NAMES.withdrawalQueue,
    );
    const tx = await unsteth.transferPopulateTx({
      id: nftId,
      to: altAccount.address,
    });
    expectAddress(tx.to, wqAddress);
    expectAddress(tx.from, account.address);
    expectPopulatedTx(tx, undefined);
    await expectPopulatedTxToRun(tx, core.rpcProvider);
  });

  testSpending('can simulate transfer token', async () => {
    const wqAddress = await core.getContractAddress(
      LIDO_CONTRACT_NAMES.withdrawalQueue,
    );
    const tx = await unsteth.transferSimulateTx({
      id: nftId,
      to: altAccount.address,
    });
    expectAddress(tx.request.address, wqAddress);
    expect(tx.request.functionName).toBe('safeTransferFrom');
  });

  testSpending('can transfer token', async () => {
    const mock = jest.fn();
    const tx = await unsteth.transfer({
      id: nftId,
      to: altAccount.address,
      callback: mock,
    });
    expectTxCallback(mock, tx);
    const owner = await unsteth.getAccountByNFT(nftId);
    expectAddress(owner, altAccount.address);
    nftId = nftIds.pop() as bigint;
  });

  testSpending('can populate approve single token', async () => {
    const wqAddress = await core.getContractAddress(
      LIDO_CONTRACT_NAMES.withdrawalQueue,
    );
    const tx = await unsteth.setSingleTokenApprovalPopulateTx({
      id: nftId,
      to: altAccount.address,
    });
    expectAddress(tx.to, wqAddress);
    expectAddress(tx.from, account.address);
    expectPopulatedTx(tx, undefined);
    await expectPopulatedTxToRun(tx, core.rpcProvider);
  });

  testSpending('can simulate approve single token', async () => {
    const wqAddress = await core.getContractAddress(
      LIDO_CONTRACT_NAMES.withdrawalQueue,
    );
    const tx = await unsteth.setSingleTokenApprovalSimulateTx({
      id: nftId,
      to: altAccount.address,
    });
    expectAddress(tx.request.address, wqAddress);
    expect(tx.request.functionName).toBe('safeTransferFrom');
  });
});

import { describe, expect, test } from '@jest/globals';
import { useUnsteth } from '../../../tests/utils/fixtures/use-unsteth.js';
import { expectContract } from '../../../tests/utils/expect/expect-contract.js';
import { useRpcCore } from '../../../tests/utils/fixtures/use-core.js';
import { LIDO_CONTRACT_NAMES } from '../../index.js';
import { expectAddress } from '../../../tests/utils/expect/expect-address.js';
import {
  expectNonNegativeBn,
  expectPositiveBn,
} from '../../../tests/utils/expect/expect-bn.js';
import { useStake } from '../../../tests/utils/fixtures/use-stake.js';
import { useWithdraw } from '../../../tests/utils/fixtures/use-withdraw.js';
import { useAccount } from '../../../tests/utils/fixtures/use-wallet-client.js';
import { bigintComparator } from '../../common/utils/bigint-comparator.js';
import { testSpending } from '../../../tests/utils/test-spending.js';

describe('unsteth wallet tests', () => {
  const unsteth = useUnsteth();
  const stake = useStake();
  const account = useAccount();
  const withdraw = useWithdraw();
  const value = 100n;
  const nftCount = 5;
  let nftCountBefore = 0;
  let nftIds: bigint[] = [];

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
  });

  testSpending.each(nftIds)('owner is correct for nft $#', async (nftId) => {
    const owner = await unsteth.getAccountByNFT(nftId);
    expectAddress(owner, account.address);
  });
});

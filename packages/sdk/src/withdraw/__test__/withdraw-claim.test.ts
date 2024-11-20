/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { expect, describe, jest } from '@jest/globals';
import { useUnsteth } from '../../../tests/utils/fixtures/use-unsteth.js';
import { useAccount } from '../../../tests/utils/fixtures/use-wallet-client.js';
import { useWithdraw } from '../../../tests/utils/fixtures/use-withdraw.js';
import {
  SPENDING_TIMEOUT,
  testSpending,
} from '../../../tests/utils/test-spending.js';
import { RequestStatusWithId } from '../types.js';
import {
  expectPopulatedTx,
  expectPopulatedTxToRun,
} from '../../../tests/utils/expect/expect-populated-tx.js';
import { expectAddress } from '../../../tests/utils/expect/expect-address.js';
import { useRpcCore } from '../../../tests/utils/fixtures/use-core.js';
import { LIDO_CONTRACT_NAMES, TransactionCallback } from '../../index.js';
import { expectTxCallback } from '../../../tests/utils/expect/expect-tx-callback.js';

describe('withdraw request claim', () => {
  const core = useRpcCore();
  const { address } = useAccount();
  const unsteth = useUnsteth();
  const { requestsInfo, claim } = useWithdraw();

  let request: RequestStatusWithId = {} as any;
  let claimableETH = 0n;

  jest.setTimeout(SPENDING_TIMEOUT);

  testSpending('has at least 1 claimable requests', async () => {
    const claimable = await requestsInfo.getClaimableRequestsETHByAccount({
      account: address,
    });

    expect(claimable.sortedIds.length > 0).toBe(true);
    request = claimable.requests[0]!;
    claimableETH = claimable.ethByRequests[0]!;
  });

  testSpending('can populate claim', async () => {
    const wqAddress = await core.getContractAddress(
      LIDO_CONTRACT_NAMES.withdrawalQueue,
    );
    const tx = await claim.claimRequestsPopulateTx({
      requestsIds: [request.id],
    });
    expectPopulatedTx(tx);
    expectAddress(tx.from, address);
    expectAddress(tx.to, wqAddress);
    await expectPopulatedTxToRun(tx, core.rpcProvider);
  });

  testSpending('can simulate claim', async () => {
    const wqAddress = await core.getContractAddress(
      LIDO_CONTRACT_NAMES.withdrawalQueue,
    );
    const tx = await claim.claimRequestsSimulateTx({
      requestsIds: [request.id],
    });
    expectAddress(tx.request.address, wqAddress);
    expectAddress(tx.request.functionName, 'claimWithdrawals');
  });

  testSpending('can claim', async () => {
    const balanceBefore = await core.balanceETH(address);
    const owner = await unsteth.getAccountByNFT(request.id);
    expectAddress(owner, address);
    const mock = jest.fn<TransactionCallback>();
    const tx = await claim.claimRequests({
      requestsIds: [request.id],
      callback: mock,
    });
    const ethForGas = tx.receipt
      ? tx.receipt.effectiveGasPrice * tx.receipt.gasUsed
      : 0n;
    expectTxCallback(mock, tx);
    const balanceAfter = await core.balanceETH(address);
    expect(balanceAfter - balanceBefore).toEqual(claimableETH - ethForGas);
    await expect(unsteth.getAccountByNFT(request.id)).rejects.toBeDefined();

    expect(tx.result).toBeDefined();
    expect(tx.result?.requests).toHaveLength(1);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const claimedRequest = tx.result!.requests[0]!;

    expectAddress(claimedRequest.owner, address);
    expectAddress(claimedRequest.receiver, address);
    expect(claimedRequest.requestId).toEqual(request.id);
    expect(claimedRequest.amountOfETH).toEqual(claimableETH);
  });
});

import { expect, describe, jest, beforeAll } from '@jest/globals';
import { useWithdraw } from '../../../tests/utils/fixtures/use-withdraw.js';
import { expectAlmostEqualBn } from '../../../tests/utils/expect/expect-bn.js';
import { Address } from 'viem';
import { useWrap } from '../../../tests/utils/fixtures/use-wrap.js';
import { useAccount } from '../../../tests/utils/fixtures/use-wallet-client.js';
import { expectAddress } from '../../../tests/utils/expect/expect-address.js';
import { useWeb3Core } from '../../../tests/utils/fixtures/use-core.js';
import { PermitSignature } from '../../index.js';
import { useStake } from '../../../tests/utils/fixtures/use-stake.js';
import {
  expectPopulatedTx,
  expectPopulatedTxToRun,
} from '../../../tests/utils/expect/expect-populated-tx.js';
import {
  SPENDING_TIMEOUT,
  testSpending,
} from '../../../tests/utils/test-spending.js';
import { expectTxCallback } from '../../../tests/utils/expect/expect-tx-callback.js';
import { useSteth } from '../../../tests/utils/fixtures/use-steth.js';
import { useUnsteth } from '../../../tests/utils/fixtures/use-unsteth.js';
import { WithdrawableTokens } from '../request/types.js';
import { useWsteth } from '../../../tests/utils/fixtures/use-wsteth.js';

const ethAmount = 110n;

const testWithdrawalsWithPermit = (
  token: WithdrawableTokens,
  ethAmount: bigint,
) => {
  const { request, contract } = useWithdraw();
  const wrap = useWrap();
  const stake = useStake();
  const { address } = useAccount();
  const unsteth = useUnsteth();
  const tokenContract = token === 'stETH' ? useSteth() : useWsteth();
  const core = useWeb3Core();
  let requestsAmounts: bigint[] = [];
  let amount = 0n;
  let wqAddress: Address;
  let permit: PermitSignature;

  jest.setTimeout(SPENDING_TIMEOUT);

  beforeAll(async () => {
    const balanceBefore = await tokenContract.balance(address);
    if (token === 'stETH') {
      await stake.stakeEth({ value: ethAmount });
    } else {
      await wrap.wrapEth({ value: ethAmount });
    }
    const balanceAfter = await tokenContract.balance(address);
    amount = balanceAfter - balanceBefore;
  });

  testSpending('can split requests', async () => {
    requestsAmounts = await request.splitAmountToRequests({ amount, token });
    expect(requestsAmounts.length > 0).toBe(true);
    expect(requestsAmounts.reduce((sum, r) => (sum += r), 0n)).toEqual(amount);
  });

  testSpending('can sign permit', async () => {
    wqAddress = await contract.contractAddressWithdrawalQueue();
    permit = await core.signPermit({
      amount,
      spender: wqAddress,
      token,
    });
    expect(permit).toHaveProperty('r');
    expect(permit).toHaveProperty('s');
    expect(permit).toHaveProperty('v');
  });

  testSpending('can populate request', async () => {
    const tx = await request.requestWithdrawalWithPermitPopulateTx({
      permit,
      token,
      amount,
    });
    expectPopulatedTx(tx);
    expectAddress(tx.from, address);
    expectAddress(tx.to, wqAddress);
    await expectPopulatedTxToRun(tx, core.rpcProvider);
  });

  testSpending('can simulate request', async () => {
    const tx = await request.requestWithdrawalWithPermitSimulateTx({
      permit,
      token,
      amount,
    });
    expectAddress(tx.request.address, wqAddress);
  });

  testSpending('can request withdrawals with permit', async () => {
    const balanceBefore = await tokenContract.balance(address);
    const nftsBefore = await unsteth.getNFTsByAccount(address);
    const mock = jest.fn();
    const tx = await request.requestWithdrawalWithPermit({
      permit,
      token,
      amount,
      callback: mock,
    });
    expectTxCallback(mock, tx);

    const balanceAfter = await tokenContract.balance(address);
    expectAlmostEqualBn(balanceAfter - balanceBefore, -amount);

    const nftsAfter = await unsteth.getNFTsByAccount(address);
    expect(nftsAfter.length - nftsBefore.length).toBe(requestsAmounts.length);
  });
};

describe('withdraw stETH request with permit', () => {
  testWithdrawalsWithPermit('stETH', ethAmount);
});

describe('withdraw wstETH request with permit', () => {
  testWithdrawalsWithPermit('wstETH', ethAmount);
});

const testWithdrawals = (token: WithdrawableTokens, ethAmount: bigint) => {
  const { request, contract, approval } = useWithdraw();
  const { address } = useAccount();
  const unsteth = useUnsteth();
  const wrap = useWrap();
  const stake = useStake();
  const tokenContract = token === 'stETH' ? useSteth() : useWsteth();
  const core = useWeb3Core();
  let amount = 0n;
  let requestsAmounts: bigint[] = [];
  let wqAddress: Address;

  jest.setTimeout(SPENDING_TIMEOUT);

  beforeAll(async () => {
    wqAddress = await contract.contractAddressWithdrawalQueue();
    const allowance = await tokenContract.allowance({
      account: address,
      to: wqAddress,
    });
    if (allowance > 0n) {
      await tokenContract.approve({ to: wqAddress, amount: 0n });
    }

    const balanceBefore = await tokenContract.balance(address);
    if (token === 'stETH') {
      await stake.stakeEth({ value: ethAmount });
    } else {
      await wrap.wrapEth({ value: ethAmount });
    }
    const balanceAfter = await tokenContract.balance(address);
    amount = balanceAfter - balanceBefore;
  });

  testSpending('can split requests', async () => {
    requestsAmounts = await request.splitAmountToRequests({ amount, token });
    expect(requestsAmounts.length > 0).toBe(true);
    expect(requestsAmounts.reduce((sum, r) => (sum += r), 0n)).toEqual(amount);
  });

  testSpending('correct zero allowance', async () => {
    const { allowance, needsApprove } = await approval.checkAllowance({
      amount,
      token,
      account: address,
    });
    const allowanceGet = await approval.getAllowance({
      token,
      account: address,
    });
    const allowanceToken = await tokenContract.allowance({
      account: address,
      to: wqAddress,
    });

    expect(needsApprove).toBe(true);
    expect(allowance).toEqual(0n);
    expect(allowance).toEqual(allowanceGet);
    expect(allowance).toEqual(allowanceToken);
  });

  testSpending('can populate approve', async () => {
    const tokenAddress = await tokenContract.contractAddress();
    const altTx = await tokenContract.populateApprove({
      amount,
      to: wqAddress,
    });
    const tx = await approval.approvePopulateTx({
      token,
      amount,
    });
    expectPopulatedTx(tx, undefined, altTx.data);
    expectAddress(tx.from, address);
    expectAddress(tx.to, tokenAddress);
    await expectPopulatedTxToRun(tx, core.rpcProvider);
  });

  testSpending('can simulate approve', async () => {
    const tokenAddress = await tokenContract.contractAddress();
    const tx = await approval.approveSimulateTx({
      token,
      amount,
    });
    expectAddress(tx.request.address, tokenAddress);
  });

  testSpending.failing('cannot withdraw without approve', async () => {
    await request.requestWithdrawal({ token, amount });
  });

  testSpending('can approve', async () => {
    const mock = jest.fn();
    const tx = await approval.approve({
      token,
      amount,
      callback: mock,
    });
    expectTxCallback(mock, tx);
  });

  testSpending('correct allowance', async () => {
    const { allowance, needsApprove } = await approval.checkAllowance({
      amount,
      token,
      account: address,
    });
    const allowanceGet = await approval.getAllowance({
      token,
      account: address,
    });
    const allowanceToken = await tokenContract.allowance({
      account: address,
      to: wqAddress,
    });

    expect(needsApprove).toBe(false);
    expect(allowance).toEqual(amount);
    expect(allowance).toEqual(allowanceGet);
    expect(allowance).toEqual(allowanceToken);
  });

  testSpending('can populate request', async () => {
    const tx = await request.requestWithdrawalPopulateTx({
      token,
      amount,
    });
    expectPopulatedTx(tx);
    expectAddress(tx.from, address);
    expectAddress(tx.to, wqAddress);
    await expectPopulatedTxToRun(tx, core.rpcProvider);
  });

  testSpending('can simulate request', async () => {
    const tx = await request.requestWithdrawalSimulateTx({
      token,
      amount,
    });
    expectAddress(tx.request.address, wqAddress);
  });

  testSpending('can request withdrawals', async () => {
    const balanceBefore = await tokenContract.balance(address);
    const nftsBefore = await unsteth.getNFTsByAccount(address);
    const mock = jest.fn();
    const tx = await request.requestWithdrawal({
      token,
      amount,
      callback: mock,
    });
    expectTxCallback(mock, tx);

    const balanceAfter = await tokenContract.balance(address);
    expectAlmostEqualBn(balanceAfter - balanceBefore, -amount);

    const nftsAfter = await unsteth.getNFTsByAccount(address);
    expect(nftsAfter.length - nftsBefore.length).toBe(requestsAmounts.length);
  });
};

describe('withdraw stETH request', () => {
  testWithdrawals('stETH', ethAmount);
});

describe('withdraw wstETH request', () => {
  testWithdrawals('wstETH', ethAmount);
});

import { beforeAll, describe, expect, jest, test } from '@jest/globals';
import { expectSDKModule } from '../../../tests/utils/expect/expect-sdk-module.js';
import {
  useL2,
  useL2Rpc,
  useTestL2RpcProvider,
} from '../../../tests/utils/fixtures/use-l2.js';
import { LidoSDKL2 } from '../l2.js';
import { LidoSDKL2Steth, LidoSDKL2Wsteth } from '../tokens.js';
import { expectERC20 } from '../../../tests/utils/expect/expect-erc20.js';
import { LIDO_L2_CONTRACT_NAMES } from '../../common/constants.js';
import { expectERC20Wallet } from '../../../tests/utils/expect/expect-erc20-wallet.js';
import {
  useAccount,
  useAltAccount,
} from '../../../tests/utils/fixtures/use-wallet-client.js';
import { getContract } from 'viem';
import { bridgedWstethAbi } from '../abi/brigedWsteth.js';
import { expectAddress } from '../../../tests/utils/expect/expect-address.js';
import { expectContract } from '../../../tests/utils/expect/expect-contract.js';
import {
  expectAlmostEqualBn,
  expectNonNegativeBn,
} from '../../../tests/utils/expect/expect-bn.js';
import {
  SPENDING_TIMEOUT,
  testSpending,
} from '../../../tests/utils/test-spending.js';
import { expectTxCallback } from '../../../tests/utils/expect/expect-tx-callback.js';
import {
  expectPopulatedTx,
  expectPopulatedTxToRun,
} from '../../../tests/utils/expect/expect-populated-tx.js';

const prepareL2Wsteth = async () => {
  const l2 = useL2();
  const account = useAccount();
  const { testClient } = useTestL2RpcProvider();
  const wstethAddress = await l2.wsteth.contractAddress();

  const wstethImpersonated = getContract({
    abi: bridgedWstethAbi,
    address: wstethAddress,
    client: testClient,
  });

  const bridge = await wstethImpersonated.read.bridge();

  await testClient.setBalance({
    address: account.address,
    value: 100000000000000n,
  });

  await testClient.setBalance({
    address: bridge,
    value: 100000000000000n,
  });

  await testClient.request({
    method: 'evm_addAccount' as any,
    params: [bridge, 'pass'],
  });

  await testClient.request({
    method: 'personal_unlockAccount' as any,
    params: [bridge, 'pass'],
  });

  await wstethImpersonated.write.bridgeMint([account.address, 2000n], {
    account: bridge,
    chain: testClient.chain,
  });
};

describe('LidoSDKL2', () => {
  const l2 = useL2();
  const account = useAccount();
  beforeAll(async () => {
    await prepareL2Wsteth();
  });

  test('is correct module', () => {
    expectSDKModule(LidoSDKL2);
  });

  test('has correct address', async () => {
    const address = await l2.contractAddress();
    const stethAddress = l2.core.getL2ContractAddress(
      LIDO_L2_CONTRACT_NAMES.steth,
    );
    expectAddress(address, stethAddress);
  });

  test('has contract', async () => {
    const stethAddress = l2.core.getL2ContractAddress(
      LIDO_L2_CONTRACT_NAMES.steth,
    );
    const contract = await l2.getContract();
    expectContract(contract, stethAddress);
  });

  test('get allowance', async () => {
    const allowance = await l2.getWstethForWrapAllowance(account.address);
    expectNonNegativeBn(allowance);

    const contractAddress = await l2.contractAddress();
    const altAllowance = await l2.wsteth.allowance({
      account: account.address,
      to: contractAddress,
    });
    expect(allowance).toEqual(altAllowance);
  });
});

describe('LidoSDKL2 wrap', () => {
  const l2 = useL2();
  const account = useAccount();

  const value = 100n;

  beforeAll(prepareL2Wsteth);

  testSpending('set allowance', async () => {
    const mock = jest.fn();
    const tx = await l2.approveWstethForWrap({ value, callback: mock });
    expectTxCallback(mock, tx);
    await expect(l2.getWstethForWrapAllowance(account)).resolves.toEqual(value);
  });

  testSpending('wrap populate', async () => {
    const stethAddress = l2.core.getL2ContractAddress(
      LIDO_L2_CONTRACT_NAMES.steth,
    );
    const tx = await l2.wrapWstethToStethPopulateTx({ value });
    expectAddress(tx.to, stethAddress);
    expectAddress(tx.from, account.address);
    expectPopulatedTx(tx, undefined);
    await expectPopulatedTxToRun(tx, l2.core.rpcProvider);
  });

  testSpending('wrap simulate', async () => {
    const stethAddress = l2.core.getL2ContractAddress(
      LIDO_L2_CONTRACT_NAMES.steth,
    );
    const tx = await l2.wrapWstethToStethSimulateTx({ value });
    expectAddress(tx.address, stethAddress);
  });

  testSpending('wrap wsteth to steth', async () => {
    const stethValue = await l2.steth.convertToSteth(value);
    const stethBalanceBefore = await l2.steth.balance(account.address);
    const wstethBalanceBefore = await l2.wsteth.balance(account.address);
    const mock = jest.fn();
    const tx = await l2.wrapWstethToSteth({ value, callback: mock });
    expectTxCallback(mock, tx);
    const stethBalanceAfter = await l2.steth.balance(account.address);
    const wstethBalanceAfter = await l2.wsteth.balance(account.address);

    const stethDiff = stethBalanceAfter - stethBalanceBefore;
    const wstethDiff = wstethBalanceAfter - wstethBalanceBefore;

    expectAlmostEqualBn(stethDiff, stethValue);
    expectAlmostEqualBn(wstethDiff, -value);

    expect(tx.result).toBeDefined();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const result = tx.result!;
    expectAlmostEqualBn(result.stethReceived, stethDiff);
    expect(result.wstethWrapped).toEqual(-wstethDiff);

    await expect(
      l2.getWstethForWrapAllowance(account.address),
    ).resolves.toEqual(0n);
  });

  testSpending('unwrap steth populate', async () => {
    const stethAddress = l2.core.getL2ContractAddress(
      LIDO_L2_CONTRACT_NAMES.steth,
    );
    const tx = await l2.unwrapPopulateTx({ value });
    expectAddress(tx.to, stethAddress);
    expectAddress(tx.from, account.address);
    expectPopulatedTx(tx, undefined);
    await expectPopulatedTxToRun(tx, l2.core.rpcProvider);
  });

  testSpending('unwrap steth simulate', async () => {
    const stethAddress = l2.core.getL2ContractAddress(
      LIDO_L2_CONTRACT_NAMES.steth,
    );
    const tx = await l2.unwrapSimulateTx({ value });
    expectAddress(tx.address, stethAddress);
  });

  testSpending('unwrap', async () => {
    const stethValue = await l2.steth.convertToSteth(value);
    const stethBalanceBefore = await l2.steth.balance(account.address);
    const wstethBalanceBefore = await l2.wsteth.balance(account.address);
    const mock = jest.fn();
    const tx = await l2.unwrap({ value: stethValue, callback: mock });
    expectTxCallback(mock, tx);
    const stethBalanceAfter = await l2.steth.balance(account.address);
    const wstethBalanceAfter = await l2.wsteth.balance(account.address);

    const stethDiff = stethBalanceAfter - stethBalanceBefore;
    const wstethDiff = wstethBalanceAfter - wstethBalanceBefore;

    expectAlmostEqualBn(stethDiff, -stethValue);
    expectAlmostEqualBn(wstethDiff, value);

    expect(tx.result).toBeDefined();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { stethUnwrapped, wstethReceived } = tx.result!;
    expectAlmostEqualBn(stethUnwrapped, -stethDiff);
    expect(wstethReceived).toEqual(wstethDiff);
  });
});

describe('LidoSDKL2Wsteth', () => {
  const l2 = useL2();
  const l2Rpc = useL2Rpc();

  beforeAll(async () => {
    await prepareL2Wsteth();
  });

  // wstETH erc20 tests
  expectERC20({
    contractName: LIDO_L2_CONTRACT_NAMES.wsteth,
    constructedWithWeb3Core: l2.wsteth,
    isL2: true,
    ModulePrototype: LidoSDKL2Wsteth,
    constructedWithRpcCore: l2Rpc.wsteth,
  });

  expectERC20Wallet({
    contractName: LIDO_L2_CONTRACT_NAMES.wsteth,
    constructedWithWeb3Core: l2.wsteth,
    isL2: true,
    constructedWithRpcCore: l2Rpc.wsteth,
  });
});

describe('LidoSDKL2Steth', () => {
  const l2 = useL2();
  const l2Rpc = useL2Rpc();
  const account = useAccount();

  beforeAll(async () => {
    await prepareL2Wsteth();

    await l2.approveWstethForWrap({ value: 1000n, account });
    await l2.wrapWstethToSteth({ value: 1000n, account });
  });

  // stETH erc20 tests
  expectERC20({
    ModulePrototype: LidoSDKL2Steth,
    contractName: LIDO_L2_CONTRACT_NAMES.steth,
    constructedWithWeb3Core: l2.steth,
    isL2: true,
    constructedWithRpcCore: l2Rpc.steth,
  });

  expectERC20Wallet({
    contractName: LIDO_L2_CONTRACT_NAMES.steth,
    constructedWithWeb3Core: l2.steth,
    isL2: true,
    constructedWithRpcCore: l2Rpc.steth,
  });
});

describe('LidoSDKL2Steth shares', () => {
  const l2 = useL2();
  const account = useAccount();
  const { address: altAddress } = useAltAccount();
  const value = 1000n;

  beforeAll(async () => {
    await prepareL2Wsteth();

    await l2.approveWstethForWrap({ value, account });
    await l2.wrapWstethToSteth({ value, account });
  });

  test('shares balance and conversions', async () => {
    const balanceSteth = await l2.steth.balance();
    const shares = await l2.steth.balanceShares(account);

    const convertedToShares = await l2.steth.convertToShares(balanceSteth);
    expectAlmostEqualBn(shares, convertedToShares);
    const convertedToSteth = await l2.steth.convertToSteth(shares);
    expectAlmostEqualBn(balanceSteth, convertedToSteth);
  });

  test('populate transfer', async () => {
    const tx = await l2.steth.populateTransferShares({
      to: altAddress,
      amount: 100n,
    });
    expectPopulatedTx(tx, undefined, true);
    await expectPopulatedTxToRun(tx, l2.core.rpcProvider);
  });

  test('simulate transfer', async () => {
    const contractAddressSteth = l2.steth.core.getL2ContractAddress(
      LIDO_L2_CONTRACT_NAMES.steth,
    );
    const tx = await l2.steth.simulateTransferShares({
      to: altAddress,
      amount: 100n,
    });
    expectAddress(tx.request.address, contractAddressSteth);
    expectAddress(tx.request.functionName, 'transferShares');
  });

  testSpending(
    'can transfer shares',
    async () => {
      const amount = 100n;
      const amountSteth = await l2.steth.convertToSteth(amount);
      const balanceStethBefore = await l2.steth.balance(account.address);
      const balanceSharesBefore = await l2.steth.balanceShares(account.address);
      const mockTxCallback = jest.fn();

      const tx = await l2.steth.transferShares({
        amount,
        to: altAddress,
        callback: mockTxCallback,
      });
      expectTxCallback(mockTxCallback, tx);

      const balanceStethAfter = await l2.steth.balance(account.address);
      const balanceSharesAfter = await l2.steth.balanceShares(account.address);
      expect(balanceSharesAfter - balanceSharesBefore).toEqual(-amount);
      // due to protocol rounding error this can happen
      expectAlmostEqualBn(balanceStethAfter - balanceStethBefore, -amountSteth);
    },
    SPENDING_TIMEOUT,
  );
});

import { test, expect, describe, jest } from '@jest/globals';

import {
  useRpcCore,
  useWeb3Core,
} from '../../../tests/utils/fixtures/use-core.js';
import {
  WalletClient,
  createWalletClient,
  getContract,
  http,
  maxUint256,
  parseEther,
  zeroAddress,
} from 'viem';
import { expectAddress } from '../../../tests/utils/expect/expect-address.js';
import { useTestsEnvs } from '../../../tests/utils/fixtures/use-test-envs.js';
import { expectNonNegativeBn } from '../../../tests/utils/expect/expect-bn.js';
import {
  CHAINS,
  LIDO_CONTRACT_NAMES,
  LidoSDKCore,
  LidoSDKStake,
  PerformTransactionGasLimit,
  PerformTransactionSendTransaction,
  VIEM_CHAINS,
} from '../../index.js';
import {
  useAccount,
  useAltAccount,
} from '../../../tests/utils/fixtures/use-wallet-client.js';
import {
  MockTransportCallback,
  useMockTransport,
} from '../../../tests/utils/fixtures/use-mock-transport.js';
import { testSpending } from '../../../tests/utils/test-spending.js';
import { expectTxCallback } from '../../../tests/utils/expect/expect-tx-callback.js';
import { usePublicRpcProvider } from '../../../tests/utils/fixtures/use-test-rpc-provider.js';

const permitAbi = [
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'value', type: 'uint256' },
      { internalType: 'uint256', name: 'deadline', type: 'uint256' },
      { internalType: 'uint8', name: 'v', type: 'uint8' },
      { internalType: 'bytes32', name: 'r', type: 'bytes32' },
      { internalType: 'bytes32', name: 's', type: 'bytes32' },
    ],
    name: 'permit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

const createCore = (walletClient?: WalletClient) => {
  const { chainId } = useTestsEnvs();
  const rpcProvider = usePublicRpcProvider();
  return new LidoSDKCore({
    chainId,
    logMode: 'none',
    rpcProvider,
    web3Provider: walletClient,
  });
};

describe('Core Wallet Tests', () => {
  const { chainId } = useTestsEnvs();
  const web3Core = useWeb3Core();

  const testPermit = async (isSteth: boolean) => {
    const spender = await web3Core.getContractAddress(
      LIDO_CONTRACT_NAMES.withdrawalQueue,
    );
    const value = 1n;
    const contractAddress = await web3Core.getContractAddress(
      isSteth ? LIDO_CONTRACT_NAMES.lido : LIDO_CONTRACT_NAMES.wsteth,
    );
    const address = await web3Core.getWeb3Address();
    const {
      chainId: permitChainId,
      deadline,
      nonce,
      owner,
      spender: permitSpender,
      value: permitValue,
      r,
      s,
      v,
    } = await web3Core.signPermit({
      amount: value,
      spender,
      token: isSteth ? 'stETH' : 'wstETH',
    });

    expect(permitChainId).toBe(BigInt(chainId));
    expect(deadline).toBe(maxUint256);
    expectNonNegativeBn(nonce);
    expectAddress(owner, address);
    expectAddress(permitSpender, spender);
    expect(permitValue).toBe(value);

    expect(r).toBeDefined();
    expect(s).toBeDefined();
    expect(v).toBeDefined();

    const contract = getContract({
      abi: permitAbi,
      address: contractAddress,
      publicClient: web3Core.rpcProvider,
    });

    await contract.simulate.permit([
      owner,
      permitSpender,
      permitValue,
      deadline,
      v,
      r,
      s,
    ]);
  };

  test('web3provider is available', () => {
    const provider = web3Core.useWeb3Provider();
    expect(provider).toBeDefined();
  });

  test('getWeb3Address works', async () => {
    const address = await web3Core.getWeb3Address();
    expect(address).toBeDefined();
    expectAddress(address);
  });

  test('account has sufficient balance for testing, >5 ETH', async () => {
    const address = await web3Core.getWeb3Address();
    const balance = await web3Core.balanceETH(address);
    expect(balance).toBeGreaterThan(parseEther('5'));
  });

  test('sign permit for stETH', async () => {
    await expect(testPermit(true)).resolves.not.toThrow();
  });

  test('sign permit for wstETH', async () => {
    await expect(testPermit(false)).resolves.not.toThrow();
  });
});

describe('Account hoisting', () => {
  const altAccount = useAltAccount();
  const { rpcUrl } = useTestsEnvs();

  test('useAccount returns from prop address', async () => {
    const core = createCore();
    const account = await core.useAccount(altAccount.address);
    expectAddress(account.address, altAccount.address);
    expect(account.type).toBe('json-rpc');
  });

  test('useAccount returns from prop account', async () => {
    const core = createCore();
    const account = await core.useAccount(altAccount);
    expect(account).toBe(altAccount);
  });

  test('useAccount returns hoisted account', async () => {
    const walletClient = createWalletClient({
      account: altAccount,
      transport: http(rpcUrl),
    });
    const core = createCore(walletClient);
    const account = await core.useAccount();
    expect(account).toBe(altAccount);
  });

  test('useAccount requests account from web3Provider', async () => {
    const mockFn = jest.fn();
    const mockTransport = useMockTransport(async (args, originalRequest) => {
      mockFn(args.method);
      if (args.method === 'eth_requestAccounts') {
        return [altAccount.address];
      }
      return originalRequest();
    });

    // setup, no account
    const walletClient = createWalletClient({
      transport: mockTransport,
    });
    const core = createCore(walletClient);
    expect(core.useWeb3Provider().account).toBeUndefined();

    // first call, account hoisted
    const account = await core.useAccount();
    expect(account.address).toBe(altAccount.address);
    expect(account.type).toBe('json-rpc');
    expect(core.web3Provider?.account).toBe(account);
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn.mock.calls[0]?.[0]).toBe('eth_requestAccounts');

    // second call, account reused
    const accountReused = await core.useAccount();
    expect(accountReused).toBe(account);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});

describe('Perform Transaction', () => {
  const { chainId } = useTestsEnvs();
  const mockMultisigAddress = useRpcCore().getContractLidoLocator().address;
  const account = useAccount();
  const value = 100n;
  const testHash = '0xaaaaaabbbbbbb';

  testSpending('perform transaction works with EOA', async () => {
    const mockTransportCallback = jest.fn<MockTransportCallback>((_, next) =>
      next(),
    );
    const core = createCore(
      createWalletClient({
        account,
        chain: VIEM_CHAINS[chainId as CHAINS],
        transport: useMockTransport(mockTransportCallback),
      }),
    );
    const stake = new LidoSDKStake({ core });
    const rawContract = await stake.getContractStETH();

    const mockGetGasLimit = jest.fn<PerformTransactionGasLimit>((options) =>
      rawContract.estimateGas.submit([zeroAddress], {
        ...options,
        value,
      }),
    );
    const mockSendTransaction = jest.fn<PerformTransactionSendTransaction>(
      (options) =>
        rawContract.write.submit([zeroAddress], { ...options, value }),
    );
    const mockTxCallback = jest.fn();

    const txResult = await core.performTransaction({
      getGasLimit: mockGetGasLimit,
      sendTransaction: mockSendTransaction,
      callback: mockTxCallback,
    });
    const gasLimit = await mockGetGasLimit.mock.results[0]?.value;
    expectTxCallback(mockTxCallback, txResult);
    expect(mockGetGasLimit).toHaveBeenCalledWith({
      account,
      chain: core.chain,
      gas: undefined,
      maxFeePerGas: expect.any(BigInt),
      maxPriorityFeePerGas: expect.any(BigInt),
    });
    expect(mockSendTransaction).toHaveBeenCalledWith({
      account,
      chain: core.chain,
      gas: gasLimit,
      maxFeePerGas: mockGetGasLimit.mock.calls[0]?.[0]?.maxFeePerGas,
      maxPriorityFeePerGas:
        mockGetGasLimit.mock.calls[0]?.[0].maxPriorityFeePerGas,
    });

    expect(mockTransportCallback).toHaveBeenLastCalledWith(
      {
        method: 'eth_sendRawTransaction',
        params: expect.any(Array),
      },
      expect.anything(),
    );
  });

  testSpending('perform transaction works with Multisig', async () => {
    const mockTransportCallback = jest.fn<MockTransportCallback>(
      async (args, next) => {
        if (args.method === 'eth_sendTransaction') {
          return testHash;
        }
        return next();
      },
    );
    const core = createCore(
      createWalletClient({
        account: mockMultisigAddress,
        chain: VIEM_CHAINS[chainId as CHAINS],
        transport: useMockTransport(mockTransportCallback),
      }),
    );

    const stake = new LidoSDKStake({ core });
    const rawContract = await stake.getContractStETH();

    const mockGetGasLimit = jest.fn<PerformTransactionGasLimit>((options) =>
      rawContract.estimateGas.submit([zeroAddress], {
        ...options,
        value,
      }),
    );
    const mockSendTransaction = jest.fn<PerformTransactionSendTransaction>(
      (options) =>
        rawContract.write.submit([zeroAddress], { ...options, value }),
    );
    const mockTxCallback = jest.fn();

    const txResult = await core.performTransaction({
      getGasLimit: mockGetGasLimit,
      sendTransaction: mockSendTransaction,
      callback: mockTxCallback,
    });

    expect(txResult.hash).toBe(testHash);

    expectTxCallback(mockTxCallback, { ...txResult, isMultisig: true });
    expect(mockGetGasLimit).not.toHaveBeenCalled();
    expect(mockSendTransaction).toHaveBeenCalledWith({
      chain: core.chain,
      account: { address: mockMultisigAddress, type: 'json-rpc' },
      gas: 21000n,
      maxFeePerGas: 1n,
      maxPriorityFeePerGas: 1n,
      nonce: 1,
    });

    // first call is chainId cross-check
    expect(mockTransportCallback).toHaveBeenCalledTimes(2);
    expect(mockTransportCallback).toHaveBeenLastCalledWith(
      {
        method: 'eth_sendTransaction',
        params: expect.any(Array),
      },
      expect.anything(),
    );
  });
});

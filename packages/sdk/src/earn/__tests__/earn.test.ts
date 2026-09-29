/* eslint-disable @typescript-eslint/no-non-null-assertion -- Test fixtures assert exact call and ABI shapes. */
import { describe, expect, it, vi } from 'vitest';
import {
  createPublicClient,
  createWalletClient,
  custom,
  decodeFunctionData,
  encodeAbiParameters,
  encodeEventTopics,
  erc20Abi,
  http,
  zeroAddress,
} from 'viem';
import type { Address, Hex, TransactionReceipt } from 'viem';
import { mainnet, hoodi } from 'viem/chains';
import { LidoSDKCore } from '../../core/index.js';
import { TransactionCallbackStage } from '../../core/types.js';
import type { PerformTransactionOptions } from '../../core/types.js';
import { LidoSDKEarn } from '../earn.js';
import { EARN_MAINNET_DEPLOYMENTS } from '../deployments.js';
import type { EarnDecodedResult, EarnDeployment } from '../types.js';
import {
  EARN_SYNC_DEPOSIT_QUEUE_ABI,
  EARN_ASYNC_REDEEM_QUEUE_ABI,
  EARN_DEPOSIT_QUEUE_ABI,
  EARN_VAULT_ABI,
} from '../abi/index.js';

const account = '0x0000000000000000000000000000000000000001' as Address;
const hash: Hex = `0x${'ab'.repeat(32)}`;
const receipt = {
  status: 'success',
  transactionHash: hash,
  logs: [],
} as unknown as TransactionReceipt;
const setup = () => {
  const publicClient = createPublicClient({
    chain: mainnet,
    transport: http('http://localhost:1'),
  });
  const walletClient = createWalletClient({
    account,
    chain: mainnet,
    transport: custom({
      request: async ({ method }) => {
        if (method === 'eth_chainId') return '0x1';
        throw new Error(`Unexpected wallet method ${method}`);
      },
    }),
  });
  const core = new LidoSDKCore({ publicClient, walletClient, logMode: 'none' });
  const earn = new LidoSDKEarn({ core });
  // Typed RPC boundary mock; each test supplies the decoded contract result.
  const read = vi.spyOn(core.publicClient, 'readContract');
  return { core, earn, read };
};
const mockRead = (
  read: ReturnType<typeof setup>['read'],
  fn: (props: {
    functionName: string;
    args?: readonly unknown[];
    address?: Address;
    blockNumber?: bigint;
  }) => unknown,
) => {
  read.mockImplementation(async (props) => fn(props) as never);
};
const confirm = async (props: PerformTransactionOptions<EarnDecodedResult>) => {
  await props.callback?.({
    stage: TransactionCallbackStage.RECEIPT,
    payload: hash,
  });
  await props.callback?.({
    stage: TransactionCallbackStage.CONFIRMATION,
    payload: receipt,
  });
  return { hash, receipt, result: await props.decodeResult(receipt) };
};

describe('Earn deposits', () => {
  it.each(['eth', 'weth', 'wsteth', 'gg', 'streth', 'dvsteth'] as const)(
    'routes %s to an active EarnETH queue',
    async (token) => {
      const { earn, read } = setup();
      mockRead(read, () => 2n ** 255n);
      const call = await earn.eth.depositToQueuePopulateTx({
        account,
        token,
        assets: 123n,
      });
      const queue = EARN_MAINNET_DEPLOYMENTS.eth.depositQueues.find(
        (q) => q.token === token && !q.legacy,
      );
      expect(call.to).toBe(queue?.address);
      expect(call.value).toBe(token === 'eth' ? 123n : 0n);
      expect(
        decodeFunctionData({
          abi: EARN_SYNC_DEPOSIT_QUEUE_ABI,
          data: call.data!,
        }),
      ).toMatchObject({
        functionName: 'deposit',
        args: [123n, zeroAddress, []],
      });
    },
  );

  it('prepares explicit USDT reset and approval without estimating dependent calls', async () => {
    const { core, earn, read } = setup();
    const gas = vi.spyOn(core.publicClient, 'estimateGas');
    const reset = await earn.usd.prepareDepositApproval({
      token: 'usdt',
      assets: 0n,
    });
    const approve = await earn.usd.prepareDepositApproval({
      token: 'usdt',
      assets: 10n,
    });
    const calls = await Promise.all([reset.populate(), approve.populate()]);
    expect(
      decodeFunctionData({ abi: erc20Abi, data: calls[0]!.data! }).args,
    ).toEqual([
      EARN_MAINNET_DEPLOYMENTS.usd.depositQueues.find(
        (q) => q.token === 'usdt' && !q.legacy,
      )!.address,
      0n,
    ]);
    expect(
      decodeFunctionData({ abi: erc20Abi, data: calls[1]!.data! }).args?.[1],
    ).toBe(10n);
    expect(calls[0]?.to).toBe(EARN_MAINNET_DEPLOYMENTS.usd.tokens.usdt.address);
    expect(read).not.toHaveBeenCalled();
    expect(gas).not.toHaveBeenCalled();
  });

  it.each([
    [0n, 10n, false, false],
    [10n, 10n, true, false],
    [5n, 10n, false, true],
  ])(
    'reports USDT allowance %s for %s: sufficient=%s, reset=%s',
    async (allowance, assets, isSufficient, requiresReset) => {
      const { earn, read } = setup();
      mockRead(read, () => allowance);
      const queue = EARN_MAINNET_DEPLOYMENTS.usd.depositQueues.find(
        (q) => q.token === 'usdt' && !q.legacy,
      )!;
      expect(
        await earn.usd.getDepositAllowance({ token: 'usdt', account, assets }),
      ).toEqual({
        token: 'usdt',
        spender: queue.address,
        allowance,
        isSufficient,
        requiresReset,
      });
      expect(read.mock.calls[0]?.[0]).toMatchObject({
        address: EARN_MAINNET_DEPLOYMENTS.usd.tokens.usdt.address,
        functionName: 'allowance',
        args: [account, queue.address],
      });
    },
  );

  it('never requires a reset for tokens other than USDT', async () => {
    const { earn, read } = setup();
    mockRead(read, () => 5n);
    expect(
      await earn.usd.getDepositAllowance({
        token: 'usdc',
        account,
        assets: 10n,
      }),
    ).toMatchObject({ isSufficient: false, requiresReset: false });
  });

  it('rejects stETH and native ETH approvals', async () => {
    const { earn } = setup();
    await expect(
      // @ts-expect-error stETH is approved for wrapping in the wrap module.
      earn.eth.prepareDepositApproval({ token: 'steth', assets: 1n }),
    ).rejects.toThrow('wrap module');
    await expect(
      // @ts-expect-error Native ETH has no allowance.
      earn.eth.getDepositAllowance({ token: 'eth', account, assets: 1n }),
    ).rejects.toThrow('Native ETH');
  });

  it('keeps USDe async and sends referral/proof without changing them', async () => {
    const { earn, read } = setup();
    mockRead(read, () => 100n);
    const proof: Hex = `0x${'11'.repeat(32)}`;
    const tx = await earn.usd.prepareDepositToQueue({
      token: 'usde',
      assets: 10n,
      referralAddress: account,
      merkleProof: [proof],
    });
    const call = await tx.populate();
    expect(tx.step.route).toBe('async');
    expect(
      decodeFunctionData({ abi: EARN_DEPOSIT_QUEUE_ABI, data: call.data! })
        .args,
    ).toEqual([10n, account, [proof]]);
  });

  it('rejects zero and overflowing deposits', async () => {
    const { earn } = setup();
    await expect(
      earn.eth.prepareDepositToQueue({ token: 'eth', assets: 0n }),
    ).rejects.toMatchObject({ code: 'INVALID_ARGUMENT' });
    await expect(
      earn.eth.prepareDepositToQueue({ token: 'eth', assets: 1n << 224n }),
    ).rejects.toMatchObject({ code: 'INVALID_ARGUMENT' });
  });
});

describe('Earn withdrawal routing', () => {
  it('compares daily limits in shares and liquidity in assets', async () => {
    const { earn, read } = setup();
    let liquidAssets = 1_000_000n;
    mockRead(read, ({ functionName }) => {
      if (functionName === 'remainingDailyLimit') return [0n, 10n ** 18n];
      if (functionName === 'getWithdrawalParams') return { assets: 1_000_000n };
      if (functionName === 'getLiquidAssets') return liquidAssets;
      throw new Error(functionName);
    });
    const props = { token: 'usdc', shares: 10n ** 18n } as const;
    expect(await earn.usd.getWithdrawAvailability(props)).toMatchObject({
      status: 'available',
      assets: 1_000_000n,
    });
    liquidAssets = 999_999n;
    expect(await earn.usd.getWithdrawAvailability(props)).toEqual({
      status: 'unavailable',
      reason: 'liquidity',
    });
    expect(
      await earn.usd.getWithdrawAvailability({
        ...props,
        shares: 10n ** 18n + 1n,
      }),
    ).toEqual({ status: 'unavailable', reason: 'daily-limit' });
  });

  it('never attempts a sync USDT route', async () => {
    const { earn, read } = setup();
    const tx = await earn.usd.prepareWithdraw({ token: 'usdt', shares: 10n });
    expect(tx.step.route).toBe('async');
    expect(read).not.toHaveBeenCalled();
    await expect(
      earn.usd.prepareWithdraw({ token: 'usdt', shares: 10n, mode: 'sync' }),
    ).rejects.toThrow('Instant withdrawal unavailable');
  });

  it('uses sync at the exact limit and falls back above it', async () => {
    const { earn, read } = setup();
    mockRead(read, ({ functionName }) => {
      if (functionName === 'remainingDailyLimit') return [0n, 10n];
      if (functionName === 'getWithdrawalParams') return { assets: 5n };
      if (functionName === 'getLiquidAssets') return 5n;
      throw new Error(functionName);
    });
    expect(
      (await earn.usd.prepareWithdraw({ token: 'usdc', shares: 10n })).step
        .route,
    ).toBe('sync');
    expect(
      (await earn.usd.prepareWithdraw({ token: 'usdc', shares: 11n })).step
        .route,
    ).toBe('async');
  });

  it('returns unknown on RPC failure, with explicit sync failing and auto choosing async', async () => {
    const { earn, read } = setup();
    read.mockRejectedValue(new Error('RPC unavailable'));
    expect(
      await earn.eth.getWithdrawAvailability({ token: 'wsteth', shares: 10n }),
    ).toMatchObject({ status: 'unknown' });
    expect(
      (await earn.eth.prepareWithdraw({ token: 'wsteth', shares: 10n })).step
        .route,
    ).toBe('async');
    await expect(
      earn.eth.prepareWithdraw({ token: 'wsteth', shares: 10n, mode: 'sync' }),
    ).rejects.toThrow('Instant withdrawal unavailable');
  });
});

describe('Earn requests', () => {
  it('cancels only known async queues and claims shares on the vault', async () => {
    const { earn } = setup();
    const legacy = EARN_MAINNET_DEPLOYMENTS.eth.depositQueues.find(
      (q) => q.legacy,
    )!;
    const cancel = await earn.eth.cancelDepositRequestPopulateTx({
      queue: legacy.address,
    });
    expect(cancel.to).toBe(legacy.address);
    expect(
      decodeFunctionData({ abi: EARN_DEPOSIT_QUEUE_ABI, data: cancel.data! })
        .functionName,
    ).toBe('cancelDepositRequest');
    const claim = await earn.eth.claimDepositSharesPopulateTx();
    expect(claim.to).toBe(EARN_MAINNET_DEPLOYMENTS.eth.vault);
    expect(
      decodeFunctionData({ abi: EARN_VAULT_ABI, data: claim.data! }).args,
    ).toEqual([account]);
    await expect(
      earn.eth.prepareCancelDepositRequest({ queue: account }),
    ).rejects.toThrow('Unknown async');
  });

  it('keeps queue identity when collector returns several requests for the same asset', async () => {
    const { earn, read } = setup();
    const queues = EARN_MAINNET_DEPLOYMENTS.eth.depositQueues.filter(
      (q) => q.token === 'eth',
    );
    mockRead(read, () => ({
      deposits: queues.map((q) => ({
        queue: q.address,
        asset: EARN_MAINNET_DEPLOYMENTS.eth.tokens.eth.address,
        timestamp: 1n,
        eta: 0n,
        shares: 4n,
        assets: 3n,
      })),
    }));
    const requests = await earn.eth.getDepositRequests(account);
    expect(requests).toHaveLength(2);
    expect(new Set(requests.map((r) => r.queue)).size).toBe(2);
  });

  it('paginates over 100 requests on a single block', async () => {
    const { core, earn, read } = setup();
    vi.spyOn(core.publicClient, 'getBlockNumber').mockResolvedValue(123n);
    mockRead(read, ({ args }) =>
      Array.from({ length: args?.[1] === 0n ? 100 : 1 }, (_, i) => ({
        timestamp: BigInt(i) + (args?.[1] as bigint),
        assets: 2n,
        shares: 3n,
        isClaimable: true,
      })),
    );
    const requests = await earn.usd.getAllWithdrawalRequests({
      token: 'usdt',
      account,
    });
    expect(requests).toHaveLength(101);
    expect(read.mock.calls.every(([props]) => props.blockNumber === 123n)).toBe(
      true,
    );
  });

  it('claims timestamps on the selected payout queue and bounds uint32', async () => {
    const { earn } = setup();
    const tx = await earn.usd.claimWithdrawalsPopulateTx({
      token: 'usdt',
      timestamps: [123n, 123n],
    });
    expect(tx.to).toBe(
      EARN_MAINNET_DEPLOYMENTS.usd.redeemQueues.find((q) => q.token === 'usdt')
        ?.address,
    );
    expect(
      decodeFunctionData({ abi: EARN_ASYNC_REDEEM_QUEUE_ABI, data: tx.data! })
        .args,
    ).toEqual([account, [123]]);
    await expect(
      earn.usd.prepareClaimWithdrawals({
        token: 'usdt',
        timestamps: [1n << 32n],
      }),
    ).rejects.toMatchObject({ code: 'INVALID_ARGUMENT' });
  });
});

describe('Earn execution', () => {
  it('rejects reverted receipts without requiring a caller callback', async () => {
    const { core, earn } = setup();
    vi.spyOn(core, 'performTransaction').mockImplementation(async (props) => {
      await props.callback?.({
        stage: TransactionCallbackStage.RECEIPT,
        payload: hash,
      });
      await props.callback?.({
        stage: TransactionCallbackStage.CONFIRMATION,
        payload: { ...receipt, status: 'reverted' },
      });
      return { hash };
    });
    await expect(
      earn.eth.withdraw({ token: 'wsteth', shares: 10n, mode: 'async' }),
    ).rejects.toMatchObject({ submittedHash: hash, code: 'TRANSACTION_ERROR' });
  });

  it('returns a submitted multisig hash without sending additional transactions', async () => {
    const { core, earn, read } = setup();
    const send = vi
      .spyOn(core, 'performTransaction')
      .mockResolvedValue({ hash });
    const result = await earn.usd.depositToQueue({
      token: 'usdc',
      assets: 10n,
    });
    expect(result).toEqual({ hash });
    expect(send).toHaveBeenCalledTimes(1);
    expect(read).not.toHaveBeenCalled();
  });

  it('filters deposit events by emitter and account', async () => {
    const { core, earn } = setup();
    const queue = EARN_MAINNET_DEPLOYMENTS.eth.depositQueues.find(
      (q) => q.token === 'eth' && !q.legacy,
    )!;
    const topics = encodeEventTopics({
      abi: EARN_SYNC_DEPOSIT_QUEUE_ABI,
      eventName: 'Deposited',
      args: { account, referral: zeroAddress },
    });
    // Use the ABI's non-indexed parameters rather than assuming event layout.
    const event = EARN_SYNC_DEPOSIT_QUEUE_ABI.find(
      (item) => item.type === 'event' && item.name === 'Deposited',
    )!;
    const data = encodeAbiParameters(
      event.inputs.filter((input) => !input.indexed),
      [10n, 7n, 0n],
    );
    const makeLog = (address: Address) => ({
      address,
      topics,
      data,
      removed: false,
    });
    const eventReceipt = {
      ...receipt,
      logs: [makeLog(account), makeLog(queue.address)],
    } as unknown as TransactionReceipt;
    vi.spyOn(core, 'performTransaction').mockImplementation(
      async (props) =>
        ({
          hash,
          receipt: eventReceipt,
          result: await props.decodeResult?.(eventReceipt),
        }) as never,
    );
    expect(
      (await earn.eth.depositToQueue({ token: 'eth', assets: 10n })).result,
    ).toEqual({ receivedShares: 7n });
  });

  it('constructs on unsupported chains without touching RPC', () => {
    const core = new LidoSDKCore({
      publicClient: createPublicClient({
        chain: hoodi,
        transport: http('http://localhost:1'),
      }),
      logMode: 'none',
    });
    const earn = new LidoSDKEarn({ core });
    expect(() => earn.eth.getDeployment()).toThrow('not configured');
  });

  it('snapshots a custom deployment at construction', async () => {
    const { core, read } = setup();
    const deployment = structuredClone(
      EARN_MAINNET_DEPLOYMENTS.usd,
    ) as EarnDeployment & { collector: Address };
    const earn = new LidoSDKEarn({ core, vaults: { usd: { deployment } } });
    deployment.collector = account;
    mockRead(read, () => ({ deposits: [] }));
    await earn.usd.collect();
    expect(read.mock.calls[0]?.[0].address).toBe(
      EARN_MAINNET_DEPLOYMENTS.usd.collector,
    );
  });

  it('isolates returned deployment copies', () => {
    const { earn } = setup();
    const deployment = earn.eth.getDeployment();
    Object.assign(deployment, { vault: account });
    expect(earn.eth.getDeployment().vault).toBe(
      EARN_MAINNET_DEPLOYMENTS.eth.vault,
    );
  });
});

describe('Earn prepared calls and previews', () => {
  it('binds prepared calls to one account', async () => {
    const { earn, read } = setup();
    mockRead(read, () => 100n);
    const tx = await earn.usd.prepareDepositToQueue({
      token: 'usdc',
      assets: 10n,
    });
    await expect(tx.populate({ account: zeroAddress })).rejects.toThrow(
      'different account',
    );
    const claim = await earn.usd.prepareClaimWithdrawals({
      token: 'usdc',
      timestamps: [123n],
    });
    await expect(claim.populate({ account: zeroAddress })).rejects.toThrow(
      'different account',
    );
  });

  it('uses USDC for USD position valuation even when USDT withdrawal is supported', async () => {
    const { earn, read } = setup();
    mockRead(read, ({ functionName }) =>
      functionName === 'balanceOf' ? 10n : { assets: 1_000_000n },
    );
    const position = await earn.usd.getPosition(account);
    expect(position).toMatchObject({
      token: 'usdc',
      decimals: 6,
      assets: 1_000_000n,
    });
    expect(read.mock.calls[1]?.[0].args?.[1]).toBe(
      EARN_MAINNET_DEPLOYMENTS.usd.redeemQueues.find(
        (q) => q.token === 'usdc' && q.kind === 'async',
      )?.address,
    );
  });

  it('returns collector eligibility and converts stETH before previewing', async () => {
    const { earn, read } = setup();
    mockRead(read, ({ functionName }) =>
      functionName === 'getWstETHByStETH'
        ? 7n
        : {
            shares: 5n,
            assets: 7n,
            isDepositPossible: false,
            isDepositorWhitelisted: false,
            isMerkleProofRequired: true,
            eta: 123n,
          },
    );
    expect(
      await earn.eth.previewDeposit({ token: 'steth', assets: 10n, account }),
    ).toMatchObject({
      shares: 5n,
      token: 'wsteth',
      inputAssets: 10n,
      isDepositPossible: false,
      isMerkleProofRequired: true,
    });
    expect(read.mock.calls[1]?.[0].args?.[1]).toBe(7n);
    // Only read options reach the conversion call, not preview props.
    expect(read.mock.calls[0]?.[0]).not.toHaveProperty('account');
    expect(read.mock.calls[0]?.[0]).not.toHaveProperty('token');
  });

  it('resolves FeeManager from the vault and preserves raw D6 fees', async () => {
    const { earn, read } = setup();
    mockRead(read, ({ functionName }) =>
      functionName === 'feeManager'
        ? account
        : functionName === 'protocolFeeD6'
          ? 5000
          : 200000,
    );
    expect(await earn.usd.getFees()).toEqual({
      feeManager: account,
      protocolFeeD6: 5000,
      performanceFeeD6: 200000,
    });
    expect(
      read.mock.calls.slice(1).every(([props]) => props.address === account),
    ).toBe(true);
  });

  it('supports population, simulation, estimation and sending of a prepared call', async () => {
    const { core, earn } = setup();
    const estimate = vi
      .spyOn(core.publicClient, 'estimateGas')
      .mockResolvedValue(1001n);
    const simulate = vi
      .spyOn(core.publicClient, 'call')
      .mockResolvedValue({ data: '0x' });
    const send = vi
      .spyOn(core, 'performTransaction')
      .mockImplementation(confirm as never);
    const props = { token: 'wsteth', shares: 10n, mode: 'async' } as const;
    const call = await earn.eth.withdrawPopulateTx(props);
    expect((await earn.eth.withdrawSimulateTx(props)).request.data).toBe(
      call.data,
    );
    expect(await earn.eth.withdrawEstimateGas(props)).toBe(1001n);
    expect((await earn.eth.withdraw(props)).receipt?.status).toBe('success');
    expect(estimate).toHaveBeenCalledTimes(1);
    expect(simulate).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it('propagates simulation failures and never sends a transaction', async () => {
    const { core, earn } = setup();
    vi.spyOn(core.publicClient, 'call').mockRejectedValue(
      new Error('simulation reverted'),
    );
    const send = vi.spyOn(core, 'performTransaction');
    await expect(
      earn.eth.withdrawSimulateTx({
        token: 'wsteth',
        shares: 10n,
        mode: 'async',
      }),
    ).rejects.toThrow('simulation reverted');
    expect(send).not.toHaveBeenCalled();
  });
});

describe('Earn single-call API', () => {
  it('provides all single deposit variants without adding approvals', async () => {
    const { core, earn } = setup();
    vi.spyOn(core.publicClient, 'estimateGas').mockResolvedValue(100n);
    vi.spyOn(core.publicClient, 'call').mockResolvedValue({ data: '0x' });
    vi.spyOn(core, 'performTransaction').mockImplementation(confirm as never);
    const props = { token: 'eth', assets: 10n } as const;
    expect((await earn.eth.depositToQueuePopulateTx(props)).value).toBe(10n);
    expect(await earn.eth.depositToQueueEstimateGas(props)).toBe(100n);
    expect((await earn.eth.depositToQueueSimulateTx(props)).request.value).toBe(
      10n,
    );
    expect((await earn.eth.depositToQueue(props)).receipt?.status).toBe(
      'success',
    );
    await expect(
      // @ts-expect-error stETH is excluded from queue deposit tokens.
      earn.eth.prepareDepositToQueue({ token: 'steth', assets: 10n }),
    ).rejects.toThrow('wrap stETH first');
  });

  it('rejects rebinding a prepared receiver', async () => {
    const { earn } = setup();
    const tx = await earn.eth.prepareClaimDepositShares();
    expect(() => tx.bindAccount(zeroAddress)).toThrow('Cannot rebind');
  });
});

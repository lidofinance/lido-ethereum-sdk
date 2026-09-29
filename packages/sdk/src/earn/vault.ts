import { abi as WSTETH_WRAP_ABI } from '../wrap/abi/wsteth.js';
import {
  encodeFunctionData,
  erc20Abi,
  getContract,
  isAddressEqual,
  parseEventLogs,
  zeroAddress,
} from 'viem';
import type { Address } from 'viem';
import { LidoSDKModule } from '../common/class-primitives/sdk-module.js';
import { CHAINS } from '../common/constants.js';
import type { LidoSDKCommonProps } from '../core/types.js';
import {
  ERROR_CODE,
  SDKError,
  invariant,
  invariantArgument,
} from '../common/utils/sdk-error.js';
import {
  EARN_COLLECTOR_ABI,
  EARN_DEPOSIT_QUEUE_ABI,
  EARN_SYNC_DEPOSIT_QUEUE_ABI,
  EARN_ASYNC_REDEEM_QUEUE_ABI,
  EARN_SYNC_REDEEM_QUEUE_ABI,
  EARN_SHARE_MANAGER_ABI,
  EARN_VAULT_ABI,
  EARN_FEE_MANAGER_ABI,
} from './abi/index.js';
import { EARN_MAINNET_DEPLOYMENTS } from './deployments.js';
import {
  EARN_COLLECTOR_CONFIG,
  assertEarnAddress,
  assertEarnAmount,
} from './utils.js';
import { EarnTransaction } from './transaction.js';
import type {
  EarnVaultId,
  EarnDeployment,
  EarnQueue,
  EarnToken,
  EarnReadOptions,
  EarnCollectorConfig,
  EarnDepositToken,
  EarnApprovalToken,
  EarnDepositAllowance,
  EarnWithdrawToken,
  EarnDepositProps,
  EarnWithdrawProps,
  EarnAvailability,
  EarnTransactionProps,
  EarnCancelProps,
  EarnClaimProps,
  EarnDepositRequest,
  EarnWithdrawalRequest,
} from './types.js';

// Narrow the overloaded collect ABI: viem 2.45 otherwise infers never for its result.
type SingleCollect = Extract<
  (typeof EARN_COLLECTOR_ABI)[number],
  { name: 'collect'; inputs: readonly [{ name: 'account' }, ...unknown[]] }
>;
const SINGLE_COLLECT_ABI = EARN_COLLECTOR_ABI.filter(
  (entry): entry is SingleCollect =>
    entry.type === 'function' &&
    entry.name === 'collect' &&
    entry.inputs[0]?.name === 'account',
);

export type EarnVaultOptions = {
  deployment?: EarnDeployment;
  /** Fields that are omitted keep their `EARN_COLLECTOR_CONFIG` defaults. */
  collectorConfig?: Partial<EarnCollectorConfig>;
};

export class LidoSDKEarnVault<V extends EarnVaultId> extends LidoSDKModule {
  private readonly resolvedDeployment?: EarnDeployment;
  private readonly collectorConfig: EarnCollectorConfig;

  constructor(
    props: LidoSDKCommonProps,
    public readonly id: V,
    options: EarnVaultOptions = {},
  ) {
    super(props);
    // Snapshot the manifest so external mutations cannot redirect an existing instance.
    const deployment =
      options.deployment ??
      (this.core.chainId === CHAINS.Mainnet
        ? EARN_MAINNET_DEPLOYMENTS[this.id]
        : undefined);
    this.resolvedDeployment = deployment
      ? structuredClone(deployment)
      : undefined;
    this.collectorConfig = {
      ...EARN_COLLECTOR_CONFIG,
      ...options.collectorConfig,
    };
  }

  /** Internal snapshot; never returned to callers without cloning. */
  private deployment(): EarnDeployment {
    const deployment = this.resolvedDeployment;
    invariant(
      deployment && deployment.chainId === this.core.chainId,
      'Earn deployment is not configured for this chain',
      ERROR_CODE.NOT_SUPPORTED,
    );
    return deployment;
  }

  getDeployment(): EarnDeployment {
    return structuredClone(this.deployment());
  }

  getCapabilities() {
    const { depositQueues, redeemQueues } = this.getDeployment();
    return { depositQueues, redeemQueues };
  }

  private token(token: EarnToken) {
    const info = this.deployment().tokens[token];
    invariantArgument(info, `Unsupported Earn token: ${token}`);
    assertEarnAddress(info.address);
    return info;
  }

  private depositQueue(token: EarnToken): EarnQueue {
    const queue = this.deployment().depositQueues.find(
      (q) => q.token === token && !q.legacy,
    );
    invariantArgument(queue, `No active deposit queue for ${token}`);
    return queue;
  }

  private redeemQueue(token: EarnToken, kind: 'sync' | 'async') {
    return this.deployment().redeemQueues.find(
      (q) => q.token === token && q.kind === kind,
    );
  }

  private asyncQueue(token: EarnToken) {
    const queue = this.redeemQueue(token, 'async');
    invariantArgument(queue, `No async redeem queue for ${token}`);
    return queue;
  }

  private collector() {
    return getContract({
      address: this.deployment().collector,
      abi: EARN_COLLECTOR_ABI,
      client: this.core.publicClient,
    });
  }

  async collect(account: Address = zeroAddress, options: EarnReadOptions = {}) {
    assertEarnAddress(account, true);
    return this.core.publicClient.readContract({
      address: this.deployment().collector,
      abi: SINGLE_COLLECT_ABI,
      functionName: 'collect',
      args: [account, this.deployment().vault, this.collectorConfig],
      ...options,
    });
  }

  async balance(account: Address, options: EarnReadOptions = {}) {
    assertEarnAddress(account);
    return this.core.publicClient.readContract({
      address: this.deployment().shareManager,
      abi: EARN_SHARE_MANAGER_ABI,
      functionName: 'balanceOf',
      args: [account],
      ...options,
    });
  }

  async getPosition(account: Address, options: EarnReadOptions = {}) {
    const shares = await this.balance(account, options);
    const token = this.deployment().valuationToken;
    const queue = this.asyncQueue(token);
    const preview = await this.collector().read.getWithdrawalParams(
      [shares, queue.address, this.collectorConfig],
      options,
    );
    return {
      shares,
      assets: preview.assets,
      token,
      ...this.token(token),
      shareManager: this.deployment().shareManager,
    };
  }

  async getFees(options: EarnReadOptions = {}) {
    const address = await this.core.publicClient.readContract({
      address: this.deployment().vault,
      abi: EARN_VAULT_ABI,
      functionName: 'feeManager',
      ...options,
    });
    const feeManager = getContract({
      address,
      abi: EARN_FEE_MANAGER_ABI,
      client: this.core.publicClient,
    });
    const [protocolFeeD6, performanceFeeD6] = await Promise.all([
      feeManager.read.protocolFeeD6(options),
      feeManager.read.performanceFeeD6(options),
    ]);
    return { feeManager: address, protocolFeeD6, performanceFeeD6 };
  }

  async convertStethToWsteth(assets: bigint, options: EarnReadOptions = {}) {
    assertEarnAmount(assets, 256, true);
    invariantArgument(this.id === 'eth', 'stETH wrapping requires EarnETH');
    return this.core.publicClient.readContract({
      address: this.token('wsteth').address,
      abi: WSTETH_WRAP_ABI,
      functionName: 'getWstETHByStETH',
      args: [assets],
      ...options,
    });
  }

  async previewDeposit(
    props: {
      token: EarnDepositToken<V>;
      assets: bigint;
      account: Address;
    } & EarnReadOptions,
  ) {
    assertEarnAmount(props.assets, 224, true);
    assertEarnAddress(props.account, true);
    const token = props.token === 'steth' ? 'wsteth' : props.token;
    const assets =
      props.token === 'steth'
        ? await this.convertStethToWsteth(props.assets, {
            blockNumber: props.blockNumber,
          })
        : props.assets;
    const queue = this.depositQueue(token);
    const preview = await this.collector().read.getDepositParams(
      [queue.address, assets, props.account, this.collectorConfig],
      { blockNumber: props.blockNumber },
    );
    return {
      ...preview,
      queue: queue.address,
      route: queue.kind,
      token,
      assetDecimals: this.token(token).decimals,
      inputAssets: props.assets,
    };
  }

  async previewWithdraw(
    props: {
      token: EarnWithdrawToken<V>;
      shares: bigint;
      mode?: 'sync' | 'async';
    } & EarnReadOptions,
  ) {
    assertEarnAmount(props.shares, 256, true);
    const queue = this.redeemQueue(props.token, props.mode ?? 'async');
    invariantArgument(queue, 'Requested withdrawal route is not supported');
    const preview = await this.collector().read.getWithdrawalParams(
      [props.shares, queue.address, this.collectorConfig],
      { blockNumber: props.blockNumber },
    );
    return {
      ...preview,
      queue: queue.address,
      route: queue.kind,
      token: props.token,
      asset: this.token(props.token).address,
      assetDecimals: this.token(props.token).decimals,
    };
  }

  async getWithdrawAvailability(
    props: { token: EarnWithdrawToken<V>; shares: bigint } & EarnReadOptions,
  ): Promise<EarnAvailability> {
    assertEarnAmount(props.shares);
    this.asyncQueue(props.token); // An unsupported token is an argument error, not an unavailable route.
    const queue = this.redeemQueue(props.token, 'sync');
    if (!queue) return { status: 'unavailable', reason: 'no-sync-queue' };
    try {
      const contract = getContract({
        address: queue.address,
        abi: EARN_SYNC_REDEEM_QUEUE_ABI,
        client: this.core.publicClient,
      });
      const opts = { blockNumber: props.blockNumber };
      const [, remainingDailyLimit] =
        await contract.read.remainingDailyLimit(opts);
      if (props.shares > remainingDailyLimit)
        return { status: 'unavailable', reason: 'daily-limit' };
      const [{ assets }, liquidAssets] = await Promise.all([
        this.collector().read.getWithdrawalParams(
          [props.shares, queue.address, this.collectorConfig],
          opts,
        ),
        contract.read.getLiquidAssets(opts),
      ]);
      // The daily limit is in shares (checked above); liquidity is in payout-token units.
      if (assets > liquidAssets)
        return { status: 'unavailable', reason: 'liquidity' };
      return {
        status: 'available',
        queue: queue.address,
        assets,
        remainingDailyLimit,
        liquidAssets,
      };
    } catch (error) {
      return { status: 'unknown', error };
    }
  }

  async getDepositQueueRequest(
    props: { queue: Address; account: Address } & EarnReadOptions,
  ) {
    assertEarnAddress(props.account);
    const queue = this.deployment().depositQueues.find(
      (q) => isAddressEqual(q.address, props.queue) && q.kind === 'async',
    );
    invariantArgument(queue, 'Unknown async deposit queue');
    const contract = getContract({
      address: queue.address,
      abi: EARN_DEPOSIT_QUEUE_ABI,
      client: this.core.publicClient,
    });
    const opts = { blockNumber: props.blockNumber };
    const [request, claimableShares] = await Promise.all([
      contract.read.requestOf([props.account], opts),
      contract.read.claimableOf([props.account], opts),
    ]);
    return {
      queue: queue.address,
      token: queue.token,
      timestamp: request[0],
      assets: request[1],
      claimableShares,
    };
  }

  async getDepositRequests(
    account: Address,
    options: EarnReadOptions = {},
  ): Promise<EarnDepositRequest[]> {
    assertEarnAddress(account);
    const deployment = this.deployment();
    const collected = await this.collect(account, options);
    return collected.deposits.flatMap((request) => {
      const queue = deployment.depositQueues.find((q) =>
        isAddressEqual(q.address, request.queue),
      );
      if (!queue) return [];
      return [
        {
          chainId: deployment.chainId,
          vault: deployment.vault,
          queue: queue.address,
          asset: request.asset,
          token: queue.token,
          account,
          timestamp: request.timestamp,
          assets: request.assets,
          claimableShares: request.shares,
          eta: request.eta,
          isClaimable: request.eta === 0n,
        },
      ];
    });
  }

  async getWithdrawalRequests(
    props: {
      token: EarnWithdrawToken<V>;
      account: Address;
      offset?: bigint;
      limit?: bigint;
    } & EarnReadOptions,
  ): Promise<EarnWithdrawalRequest[]> {
    assertEarnAddress(props.account);
    const offset = props.offset ?? 0n;
    const limit = props.limit ?? 100n;
    assertEarnAmount(offset, 256, true);
    assertEarnAmount(limit);
    const queue = this.asyncQueue(props.token);
    const deployment = this.deployment();
    const requests = await this.core.publicClient.readContract({
      address: queue.address,
      abi: EARN_ASYNC_REDEEM_QUEUE_ABI,
      functionName: 'requestsOf',
      args: [props.account, offset, limit],
      blockNumber: props.blockNumber,
    });
    return requests.map((request) => ({
      ...request,
      chainId: deployment.chainId,
      vault: deployment.vault,
      queue: queue.address,
      asset: this.token(props.token).address,
      token: props.token,
      account: props.account,
    }));
  }

  async getAllWithdrawalRequests(
    props: {
      token: EarnWithdrawToken<V>;
      account: Address;
      pageSize?: bigint;
    } & EarnReadOptions,
  ) {
    const limit = props.pageSize ?? 100n;
    assertEarnAmount(limit);
    // Pin pagination to one block to avoid skipped/duplicated requests as the queue changes.
    const blockNumber =
      props.blockNumber ?? (await this.core.publicClient.getBlockNumber());
    const requests: EarnWithdrawalRequest[] = [];
    for (let offset = 0n; ; offset += limit) {
      const page = await this.getWithdrawalRequests({
        ...props,
        offset,
        limit,
        blockNumber,
      });
      requests.push(...page);
      if (BigInt(page.length) < limit) return requests;
    }
  }

  private approval(
    token: EarnToken,
    spender: Address,
    amount: bigint,
    reset = false,
  ) {
    assertEarnAmount(amount, 256, true);
    assertEarnAddress(spender);
    return new EarnTransaction(
      this.core,
      { kind: reset ? 'approval-reset' : 'approve', token },
      {
        to: this.token(token).address,
        value: 0n,
        data: encodeFunctionData({
          abi: erc20Abi,
          functionName: 'approve',
          args: [spender, amount],
        }),
      },
    );
  }

  private depositSpender(token: EarnToken) {
    invariantArgument(
      token !== 'steth',
      'Approve stETH for wrapping through the wrap module',
    );
    invariantArgument(token !== 'eth', 'Native ETH does not require approval');
    return this.depositQueue(token).address;
  }

  /** Reads the allowance granted to the active deposit queue and what must be approved next. */
  async getDepositAllowance(
    props: {
      token: EarnApprovalToken<V>;
      account: Address;
      assets: bigint;
    } & EarnReadOptions,
  ): Promise<EarnDepositAllowance> {
    assertEarnAddress(props.account);
    assertEarnAmount(props.assets, 224, true);
    const spender = this.depositSpender(props.token);
    const allowance = await this.core.publicClient.readContract({
      address: this.token(props.token).address,
      abi: erc20Abi,
      functionName: 'allowance',
      args: [props.account, spender],
      blockNumber: props.blockNumber,
    });
    const isSufficient = allowance >= props.assets;
    return {
      token: props.token,
      spender,
      allowance,
      isSufficient,
      // USDT reverts when changing one nonzero allowance to another.
      requiresReset: props.token === 'usdt' && allowance > 0n && !isSufficient,
    };
  }

  async prepareDepositApproval(props: {
    token: EarnApprovalToken<V>;
    assets: bigint;
  }) {
    assertEarnAmount(props.assets, 224, true);
    return this.approval(
      props.token,
      this.depositSpender(props.token),
      props.assets,
      props.assets === 0n,
    );
  }

  private depositTransaction(
    queue: EarnQueue,
    assets: bigint,
    props: EarnDepositProps<V>,
  ) {
    assertEarnAmount(assets, 224);
    const referral = props.referralAddress ?? zeroAddress;
    assertEarnAddress(referral, true);
    const proof = [...(props.merkleProof ?? [])];
    invariantArgument(
      proof.every((item) => /^0x[\da-f]{64}$/i.test(item)),
      'Merkle proof entries must be bytes32',
    );
    const data = encodeFunctionData({
      abi: EARN_SYNC_DEPOSIT_QUEUE_ABI,
      functionName: 'deposit',
      args: [assets, referral, proof],
    });
    return new EarnTransaction(
      this.core,
      {
        kind: 'deposit',
        token: queue.token,
        queue: queue.address,
        route: queue.kind,
      },
      {
        to: queue.address,
        data,
        value: queue.token === 'eth' ? assets : 0n,
      },
      (receipt, account) => {
        if (queue.kind !== 'sync') return {};
        const logs = parseEventLogs({
          abi: EARN_SYNC_DEPOSIT_QUEUE_ABI,
          eventName: 'Deposited',
          logs: receipt.logs.filter((log) =>
            isAddressEqual(log.address, queue.address),
          ),
        });
        const matching = logs.filter((log) =>
          isAddressEqual(log.args.account, account),
        );
        return {
          receivedShares:
            matching.length > 0
              ? matching.reduce((sum, log) => sum + log.args.shares, 0n)
              : undefined,
        };
      },
    );
  }

  /** Prepares one deposit call; allowance and any stETH wrapping must be handled first. */
  async prepareDepositToQueue(props: EarnDepositProps<V>) {
    invariantArgument(
      props.token !== 'steth',
      'Use the wrap module to wrap stETH first',
    );
    const account = await this.core.useAccount(props.account);
    return this.depositTransaction(
      this.depositQueue(props.token),
      props.assets,
      props,
    ).bindAccount(account.address);
  }

  async depositToQueue(props: EarnDepositProps<V>) {
    return (await this.prepareDepositToQueue(props)).send(props);
  }

  async depositToQueuePopulateTx(props: EarnDepositProps<V>) {
    return (await this.prepareDepositToQueue(props)).populate(props);
  }

  async depositToQueueEstimateGas(props: EarnDepositProps<V>) {
    return (await this.prepareDepositToQueue(props)).estimateGas(props);
  }

  async depositToQueueSimulateTx(props: EarnDepositProps<V>) {
    return (await this.prepareDepositToQueue(props)).simulate(props);
  }

  async prepareWithdraw(props: EarnWithdrawProps<V>) {
    assertEarnAmount(props.shares);
    invariantArgument(
      ['auto', 'sync', 'async'].includes(props.mode ?? 'auto'),
      'Invalid withdrawal mode',
    );
    const account = await this.core.useAccount(props.account);
    const availability =
      props.mode === 'async'
        ? undefined
        : await this.getWithdrawAvailability(props);
    if (props.mode === 'sync' && availability?.status !== 'available') {
      throw new SDKError({
        code: ERROR_CODE.TRANSACTION_ERROR,
        message: 'Instant withdrawal unavailable',
        error:
          availability?.status === 'unknown' ? availability.error : undefined,
      });
    }
    const queue =
      availability?.status === 'available'
        ? this.redeemQueue(props.token, 'sync')
        : this.asyncQueue(props.token);
    invariantArgument(queue, 'Withdrawal queue is not configured');
    return new EarnTransaction(
      this.core,
      {
        kind: 'withdraw',
        token: props.token,
        queue: queue.address,
        route: queue.kind,
      },
      {
        to: queue.address,
        value: 0n,
        data:
          queue.kind === 'sync'
            ? encodeFunctionData({
                abi: EARN_SYNC_REDEEM_QUEUE_ABI,
                functionName: 'redeem',
                args: [props.shares, account.address],
              })
            : encodeFunctionData({
                abi: EARN_ASYNC_REDEEM_QUEUE_ABI,
                functionName: 'redeem',
                args: [props.shares],
              }),
      },
    ).bindAccount(account.address);
  }

  async prepareCancelDepositRequest(props: EarnCancelProps) {
    const queue = this.deployment().depositQueues.find(
      (q) => isAddressEqual(q.address, props.queue) && q.kind === 'async',
    );
    invariantArgument(queue, 'Unknown async deposit queue');
    return new EarnTransaction(
      this.core,
      { kind: 'cancel-deposit', token: queue.token, queue: queue.address },
      {
        to: queue.address,
        value: 0n,
        data: encodeFunctionData({
          abi: EARN_DEPOSIT_QUEUE_ABI,
          functionName: 'cancelDepositRequest',
        }),
      },
    );
  }

  async prepareClaimDepositShares(props: EarnTransactionProps = {}) {
    const account = await this.core.useAccount(props.account);
    return new EarnTransaction(
      this.core,
      { kind: 'claim-deposit' },
      {
        to: this.deployment().vault,
        value: 0n,
        data: encodeFunctionData({
          abi: EARN_VAULT_ABI,
          functionName: 'claimShares',
          args: [account.address],
        }),
      },
    ).bindAccount(account.address);
  }

  async prepareClaimWithdrawals(props: EarnClaimProps<V>) {
    invariantArgument(
      props.timestamps.length > 0,
      'No withdrawal timestamps supplied',
    );
    const timestamps = [...new Set(props.timestamps)];
    timestamps.forEach((timestamp) => assertEarnAmount(timestamp, 32));
    const account = await this.core.useAccount(props.account);
    const queue = this.asyncQueue(props.token);
    return new EarnTransaction(
      this.core,
      { kind: 'claim-withdrawal', token: props.token, queue: queue.address },
      {
        to: queue.address,
        value: 0n,
        data: encodeFunctionData({
          abi: EARN_ASYNC_REDEEM_QUEUE_ABI,
          functionName: 'claim',
          args: [account.address, timestamps.map(Number)],
        }),
      },
    ).bindAccount(account.address);
  }

  async withdraw(props: EarnWithdrawProps<V>) {
    return (await this.prepareWithdraw(props)).send(props);
  }

  async withdrawPopulateTx(props: EarnWithdrawProps<V>) {
    return (await this.prepareWithdraw(props)).populate(props);
  }

  async withdrawEstimateGas(props: EarnWithdrawProps<V>) {
    return (await this.prepareWithdraw(props)).estimateGas(props);
  }

  async withdrawSimulateTx(props: EarnWithdrawProps<V>) {
    return (await this.prepareWithdraw(props)).simulate(props);
  }

  async cancelDepositRequest(props: EarnCancelProps) {
    return (await this.prepareCancelDepositRequest(props)).send(props);
  }

  async cancelDepositRequestPopulateTx(props: EarnCancelProps) {
    return (await this.prepareCancelDepositRequest(props)).populate(props);
  }

  async cancelDepositRequestEstimateGas(props: EarnCancelProps) {
    return (await this.prepareCancelDepositRequest(props)).estimateGas(props);
  }

  async cancelDepositRequestSimulateTx(props: EarnCancelProps) {
    return (await this.prepareCancelDepositRequest(props)).simulate(props);
  }

  async claimDepositShares(props: EarnTransactionProps = {}) {
    return (await this.prepareClaimDepositShares(props)).send(props);
  }

  async claimDepositSharesPopulateTx(props: EarnTransactionProps = {}) {
    return (await this.prepareClaimDepositShares(props)).populate(props);
  }

  async claimDepositSharesEstimateGas(props: EarnTransactionProps = {}) {
    return (await this.prepareClaimDepositShares(props)).estimateGas(props);
  }

  async claimDepositSharesSimulateTx(props: EarnTransactionProps = {}) {
    return (await this.prepareClaimDepositShares(props)).simulate(props);
  }

  async claimWithdrawals(props: EarnClaimProps<V>) {
    return (await this.prepareClaimWithdrawals(props)).send(props);
  }

  async claimWithdrawalsPopulateTx(props: EarnClaimProps<V>) {
    return (await this.prepareClaimWithdrawals(props)).populate(props);
  }

  async claimWithdrawalsEstimateGas(props: EarnClaimProps<V>) {
    return (await this.prepareClaimWithdrawals(props)).estimateGas(props);
  }

  async claimWithdrawalsSimulateTx(props: EarnClaimProps<V>) {
    return (await this.prepareClaimWithdrawals(props)).simulate(props);
  }
}

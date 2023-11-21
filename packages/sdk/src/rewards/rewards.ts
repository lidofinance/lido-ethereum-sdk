import {
  type Address,
  type GetContractReturnType,
  type PublicClient,
  getContract,
  zeroAddress,
} from 'viem';
import { Logger, ErrorHandler, Cache } from '../common/decorators/index.js';
import { LidoSDKModule } from '../common/class-primitives/sdk-module.js';

import { rewardsEventsAbi } from './abi/rewardsEvents.js';
import {
  type GetRewardsFromChainOptions,
  type GetRewardsFromChainResult,
  type GetRewardsFromSubgraphOptions,
  type GetRewardsFromSubgraphResult,
  type GetRewardsOptions,
  type Reward,
  type RewardsChainEvents,
  type RewardsSubgraphEvents,
} from './types.js';

import {
  EARLIEST_TOKEN_REBASED_EVENT,
  LIDO_CONTRACT_NAMES,
} from '../common/constants.js';
import {
  TotalRewardEntity,
  TransferEventEntity,
  getLastIndexedBlock,
  getTotalRewards,
  getTransfers,
} from './subgraph/index.js';
import { addressEqual } from '../common/utils/address-equal.js';
import { getInitialData } from './subgraph/index.js';
import { calcShareRate, requestWithBlockStep, sharesToSteth } from './utils.js';
import {
  ERROR_CODE,
  invariant,
  invariantArgument,
  withSDKError,
} from '../index.js';
import { LidoSDKApr } from '../statistics/apr.js';

export class LidoSDKRewards extends LidoSDKModule {
  private static readonly PRECISION = 10n ** 27n;
  private static readonly DEFAULT_STEP_ENTITIES = 1000;
  private static readonly DEFAULT_STEP_BLOCK = 50000;

  // Contracts

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['core.chain.id'])
  private async contractAddressStETH(): Promise<Address> {
    return await this.core.getContractAddress(LIDO_CONTRACT_NAMES.lido);
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['core.chain.id'])
  private async contractAddressWithdrawalQueue(): Promise<Address> {
    return await this.core.getContractAddress(
      LIDO_CONTRACT_NAMES.withdrawalQueue,
    );
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['core.chain.id'])
  private earliestRebaseEventBlock(): bigint {
    return EARLIEST_TOKEN_REBASED_EVENT[this.core.chainId];
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['core.chain.id', 'contractAddressStETH'])
  private async getContractStETH(): Promise<
    GetContractReturnType<typeof rewardsEventsAbi, PublicClient>
  > {
    const address = await this.contractAddressStETH();

    return getContract({
      address,
      abi: rewardsEventsAbi,
      publicClient: this.core.rpcProvider,
    });
  }

  @Logger('Rewards:')
  @ErrorHandler('Rewards:')
  public async getRewardsFromChain(
    props: GetRewardsFromChainOptions,
  ): Promise<GetRewardsFromChainResult> {
    const [
      { address, fromBlock, toBlock, includeZeroRebases, includeOnlyRebases },
      stethContract,
      withdrawalQueueAddress,
    ] = await Promise.all([
      this.parseProps(props),
      this.getContractStETH(),
      this.contractAddressWithdrawalQueue(),
    ]);
    const step = props.stepBlock ?? LidoSDKRewards.DEFAULT_STEP_BLOCK;
    invariantArgument(step > 0, 'stepBlock must be a positive integer');
    const lowerBound = this.earliestRebaseEventBlock();
    if (fromBlock < lowerBound)
      throw this.core.error({
        message: `Cannot index events earlier than first TokenRebased event at block ${lowerBound.toString()}`,
        code: ERROR_CODE.NOT_SUPPORTED,
      });

    const preBlock = fromBlock === 0n ? 0n : fromBlock - 1n;

    const [
      baseBalanceShares,
      baseTotalEther,
      baseTotalShares,
      transferOutEvents,
      transferInEvents,
      rebaseEvents,
    ] = await withSDKError(
      Promise.all([
        stethContract.read.sharesOf([address], {
          blockNumber: preBlock,
        }),
        stethContract.read.getTotalPooledEther({ blockNumber: preBlock }),
        stethContract.read.getTotalShares({ blockNumber: preBlock }),
        requestWithBlockStep(step, fromBlock, toBlock, (fromBlock, toBlock) =>
          stethContract.getEvents.TransferShares(
            { from: address },
            { fromBlock, toBlock },
          ),
        ),
        requestWithBlockStep(step, fromBlock, toBlock, (fromBlock, toBlock) =>
          stethContract.getEvents.TransferShares(
            { to: address },
            { fromBlock, toBlock },
          ),
        ),
        requestWithBlockStep(step, fromBlock, toBlock, (fromBlock, toBlock) =>
          stethContract.getEvents.TokenRebased(
            {},
            {
              fromBlock,
              toBlock,
            },
          ),
        ),
      ]),
      ERROR_CODE.READ_ERROR,
    );

    // concat types are broken
    const events = ([] as any[]).concat(
      transferInEvents,
      transferOutEvents,
      rebaseEvents,
    ) as RewardsChainEvents[];

    // JS sort might not be the most optimal way for merging presorted arrays
    events.sort((event1, event2) => {
      const block = event1.blockNumber - event2.blockNumber;
      if (block === 0n) {
        return event1.logIndex - event2.logIndex;
      }
      return block > 0n ? 1 : -1;
    });

    // Converts to steth based on current share rate
    let currentTotalEther = baseTotalEther;
    let currentTotalShares = baseTotalShares;
    const getCurrentStethFromShares = (shares: bigint): bigint =>
      sharesToSteth(
        shares,
        currentTotalEther,
        currentTotalShares,
        LidoSDKRewards.PRECISION,
      );
    const getCurrentShareRate = () =>
      calcShareRate(
        currentTotalEther,
        currentTotalShares,
        LidoSDKRewards.PRECISION,
      );

    const baseBalance = getCurrentStethFromShares(baseBalanceShares);
    const baseShareRate = getCurrentShareRate();

    let totalRewards = 0n;
    let shareRate = baseShareRate;
    let prevSharesBalance = baseBalanceShares;
    let rewards: Reward<RewardsChainEvents>[] = events.map((event) => {
      if (event.eventName === 'TransferShares') {
        const { from, to, sharesValue } = event.args;
        let type: Reward<RewardsChainEvents>['type'],
          changeShares: Reward<RewardsChainEvents>['changeShares'],
          balanceShares: Reward<RewardsChainEvents>['balanceShares'];

        if (to === address) {
          type = from === zeroAddress ? 'submit' : 'transfer_in';
          balanceShares = prevSharesBalance + sharesValue;
          changeShares = sharesValue;
        } else {
          type = to === withdrawalQueueAddress ? 'withdrawal' : 'transfer_out';
          balanceShares = prevSharesBalance - sharesValue;
          changeShares = -sharesValue;
        }

        prevSharesBalance = balanceShares;
        return {
          type,
          balanceShares,
          changeShares,
          change: getCurrentStethFromShares(changeShares),
          balance: getCurrentStethFromShares(balanceShares),
          shareRate,
          originalEvent: event,
        };
      }
      if (event.eventName === 'TokenRebased') {
        const { postTotalEther, postTotalShares } = event.args;
        const oldBalance = getCurrentStethFromShares(prevSharesBalance);
        currentTotalEther = postTotalEther;
        currentTotalShares = postTotalShares;
        const newBalance = getCurrentStethFromShares(prevSharesBalance);
        shareRate = getCurrentShareRate();
        const change = newBalance - oldBalance;
        totalRewards += change;
        return {
          type: 'rebase',
          change,
          apr: LidoSDKApr.calculateAprFromRebaseEvent(event.args) / 100,
          changeShares: 0n,
          balance: newBalance,
          balanceShares: prevSharesBalance,
          shareRate,
          originalEvent: event,
        };
      }
      invariant(false, 'Impossible event');
    });

    if (includeOnlyRebases) {
      rewards = rewards.filter((r) => r.type === 'rebase');
    }

    if (!includeZeroRebases) {
      rewards = rewards.filter(
        (r) => !(r.type === 'rebase' && r.change === 0n),
      );
    }

    return {
      rewards,
      baseBalanceShares,
      baseShareRate,
      baseBalance,
      totalRewards,
      fromBlock: fromBlock,
      toBlock: toBlock,
    };
  }

  @Logger('Rewards:')
  @ErrorHandler('Rewards:')
  public async getRewardsFromSubgraph(
    props: GetRewardsFromSubgraphOptions,
  ): Promise<GetRewardsFromSubgraphResult> {
    const [
      {
        getSubgraphUrl,
        address,
        fromBlock,
        toBlock,
        includeZeroRebases,
        includeOnlyRebases,
      },
      withdrawalQueueAddress,
    ] = await Promise.all([
      this.parseProps(props),
      this.contractAddressWithdrawalQueue(),
    ]);
    const url = getSubgraphUrl(this.core.getSubgraphId(), this.core.chainId);
    const step = props.stepEntities ?? LidoSDKRewards.DEFAULT_STEP_ENTITIES;
    invariantArgument(step > 0, 'stepEntities must be a positive integer');
    // Cap toBlock to last indexed
    const lastIndexedBlock = BigInt(
      (await getLastIndexedBlock({ url })).number,
    );
    const cappedToBlock =
      lastIndexedBlock < toBlock ? lastIndexedBlock : toBlock;
    const preBlock = fromBlock === 0n ? 0n : fromBlock - 1n;

    // fetch data from subgraph
    const [
      transfers,
      rebases,
      { transfer: initialTransfer, rebase: initialRebase },
    ] = await withSDKError(
      Promise.all([
        getTransfers({
          url,
          address,
          fromBlock,
          toBlock: cappedToBlock,
          step,
        }),
        getTotalRewards({ url, fromBlock, toBlock: cappedToBlock, step }),
        getInitialData({ url, address, block: preBlock }),
      ]),
      ERROR_CODE.READ_ERROR,
    );

    // concat types are broken
    const events = ([] as (TransferEventEntity | TotalRewardEntity)[]).concat(
      rebases,
      transfers,
    );

    events.sort((event1, event2) => {
      const block = BigInt(event1.block) - BigInt(event2.block);
      if (block === 0n) {
        return Number(event1.logIndex) - Number(event2.logIndex);
      }
      return block > 0n ? 1 : -1;
    });

    /// these allow us to count changes in rebase events
    // even if no transfers were detected in our range
    let prevBalanceShares = 0n;
    let prevBalance = 0n;
    let baseShareRate = 0;

    // last transfer before main query
    if (initialTransfer) {
      const {
        to,
        from,
        balanceAfterDecrease,
        balanceAfterIncrease,
        sharesAfterDecrease,
        sharesAfterIncrease,
      } = initialTransfer;
      if (addressEqual(to, address)) {
        prevBalanceShares = BigInt(sharesAfterIncrease);
        prevBalance = BigInt(balanceAfterIncrease);
      } else if (addressEqual(from, address)) {
        prevBalanceShares = BigInt(sharesAfterDecrease);
        prevBalance = BigInt(balanceAfterDecrease);
      }
    }

    // last rebase before main query
    if (initialRebase) {
      const { totalPooledEtherAfter, totalSharesAfter } = initialRebase;
      const totalEther = BigInt(totalPooledEtherAfter);
      const totalShares = BigInt(totalSharesAfter);
      baseShareRate = calcShareRate(
        totalEther,
        totalShares,
        LidoSDKRewards.PRECISION,
      );
      // we recount initial balance in case this rebase was after transfer
      // in opposite case recount will be the same value anyway
      prevBalance = sharesToSteth(
        prevBalanceShares,
        totalEther,
        totalShares,
        LidoSDKRewards.PRECISION,
      );
    }

    // fix values for return meta
    const baseBalance = prevBalance;
    const baseBalanceShares = prevBalanceShares;

    let totalRewards = 0n;
    let rewards: Reward<RewardsSubgraphEvents>[] = events.map((event) => {
      // it's a transfer
      if ('value' in event) {
        const {
          from,
          to,
          shares,
          sharesAfterIncrease,
          value,
          balanceAfterDecrease,
          balanceAfterIncrease,
          sharesAfterDecrease,
          totalPooledEther,
          totalShares,
        } = event;
        let type: Reward<RewardsSubgraphEvents>['type'],
          changeShares: Reward<RewardsSubgraphEvents>['changeShares'],
          balanceShares: Reward<RewardsSubgraphEvents>['balanceShares'],
          change: Reward<RewardsSubgraphEvents>['change'],
          balance: Reward<RewardsSubgraphEvents>['balance'];

        if (addressEqual(to, address)) {
          type = from === zeroAddress ? 'submit' : 'transfer_in';
          changeShares = BigInt(shares);
          balanceShares = BigInt(sharesAfterIncrease);
          change = BigInt(value);
          balance = BigInt(balanceAfterIncrease);
        } else {
          type = addressEqual(to, withdrawalQueueAddress)
            ? 'withdrawal'
            : 'transfer_out';
          balance = BigInt(balanceAfterDecrease);
          change = -BigInt(value);
          changeShares = -BigInt(shares);
          balanceShares = BigInt(sharesAfterDecrease);
        }

        const shareRate = calcShareRate(
          BigInt(totalPooledEther),
          BigInt(totalShares),
          LidoSDKRewards.PRECISION,
        );
        prevBalance = balance;
        prevBalanceShares = balanceShares;

        return {
          type,
          balanceShares,
          changeShares,
          change,
          balance,
          shareRate,
          originalEvent: event,
        };
      }
      // it's a rebase
      if ('apr' in event) {
        const {
          totalPooledEtherAfter,
          totalSharesAfter,
          apr: eventApr,
        } = event;

        const totalEther = BigInt(totalPooledEtherAfter);
        const totalShares = BigInt(totalSharesAfter);

        const apr = Number(eventApr);
        const newBalance = sharesToSteth(
          prevBalanceShares,
          totalEther,
          totalShares,
          LidoSDKRewards.PRECISION,
        );
        const change = newBalance - prevBalance;
        totalRewards += change;
        prevBalance = newBalance;

        return {
          type: 'rebase',
          change,
          apr,
          changeShares: 0n,
          balance: newBalance,
          balanceShares: prevBalanceShares,
          shareRate: calcShareRate(
            totalEther,
            totalShares,
            LidoSDKRewards.PRECISION,
          ),
          originalEvent: event,
        };
      }
      invariant(false, 'impossible event');
    });

    if (includeOnlyRebases) {
      rewards = rewards.filter((r) => r.type === 'rebase');
    }

    if (!includeZeroRebases) {
      rewards = rewards.filter(
        (r) => !(r.type === 'rebase' && r.change === 0n),
      );
    }

    return {
      rewards,
      baseBalance,
      lastIndexedBlock,
      baseBalanceShares,
      totalRewards,
      baseShareRate,
      fromBlock,
      toBlock: cappedToBlock,
    };
  }

  private async parseProps<TRewardsProps extends GetRewardsOptions>(
    props: TRewardsProps,
  ): Promise<
    Omit<TRewardsProps, 'toBlock' | 'fromBlock' | 'includeZeroRebases'> & {
      toBlock: bigint;
      fromBlock: bigint;
      includeZeroRebases: boolean;
      includeOnlyRebases: boolean;
    }
  > {
    const toBlock = await this.core.toBlockNumber(
      props.to ?? { block: 'latest' },
    );
    const fromBlock = props.from
      ? await this.core.toBlockNumber(props.from)
      : await this.core.toBackBlock(props.back, toBlock);

    invariantArgument(toBlock >= fromBlock, 'toBlock is lower than fromBlock');

    const { includeZeroRebases = false, includeOnlyRebases = false } = props;

    return {
      ...props,
      fromBlock,
      includeZeroRebases,
      includeOnlyRebases,
      toBlock,
    };
  }
}

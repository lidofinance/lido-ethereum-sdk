import invariant from 'tiny-invariant';
import {
  Address,
  GetContractReturnType,
  PublicClient,
  getContract,
  zeroAddress,
} from 'viem';
import { LidoSDKCore } from '../core/index.js';
import { Logger, ErrorHandler, Cache } from '../common/decorators/index.js';
import { version } from '../version.js';
import { rewardsEventsAbi } from './abi/rewardsEvents.js';
import {
  GetRewardsFromChainResults as GetRewardsFromChainResult,
  GetRewardsFromSubgraphOptions,
  GetRewardsFromSubgraphResults as GetRewardsFromSubgraphResult,
  GetRewardsOptions,
  LidoSDKRewardsProps,
  NonPendingBlockTag,
  Reward,
  RewardsChainEvents,
  RewardsSubgraphEvents,
} from './types.js';

import { LIDO_CONTRACT_NAMES } from '../common/constants.js';
import {
  TotalRewardEntity,
  TransferEventEntity,
  getLastIndexedBlock,
  getTotalRewards,
  getTransfers,
} from './subgraph/index.js';
import { addressEqual } from '../common/utils/address-equal.js';
import { getInitialData } from './subgraph/subrgaph.js';

export class LidoSDKRewards {
  readonly core: LidoSDKCore;
  private static readonly PRECISION = 10n ** 27n;

  private static calcShareRate = (
    totalEther: bigint,
    totalShares: bigint,
  ): number =>
    Number((totalEther * LidoSDKRewards.PRECISION) / totalShares) /
    Number(LidoSDKRewards.PRECISION);

  private static sharesToSteth = (
    shares: bigint,
    totalEther: bigint,
    totalShares: bigint,
  ): bigint =>
    (shares * totalEther * LidoSDKRewards.PRECISION) /
    totalShares /
    LidoSDKRewards.PRECISION;

  constructor(props: LidoSDKRewardsProps) {
    if (props.core) this.core = props.core;
    else this.core = new LidoSDKCore(props, version);
  }

  // Contracts

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['core.chain.id'])
  private async contractAddressStETH(): Promise<Address> {
    invariant(this.core.chain, 'Chain is not defined');

    return await this.core.getContractAddress(LIDO_CONTRACT_NAMES.lido);
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['core.chain.id'])
  private async contractAddressWithdrawalQueue(): Promise<Address> {
    invariant(this.core.chain, 'Chain is not defined');
    return await this.core.getContractAddress(
      LIDO_CONTRACT_NAMES.withdrawalQueue,
    );
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
    props: GetRewardsOptions,
  ): Promise<GetRewardsFromChainResult> {
    const [
      { address, fromBlock, toBlock },
      stethContract,
      withdrawalQueueAddress,
    ] = await Promise.all([
      this.parseProps(props),
      this.getContractStETH(),
      this.contractAddressWithdrawalQueue(),
    ]);

    const preBlock = fromBlock === 0n ? 0n : fromBlock - 1n;

    const [
      baseBalanceShares,
      baseTotalEther,
      baseTotalShares,
      transferOutEvents,
      transferInEvents,
      rebaseEvents,
    ] = await Promise.all([
      stethContract.read.sharesOf([address], {
        blockNumber: preBlock,
      }),
      stethContract.read.getTotalPooledEther({ blockNumber: preBlock }),
      stethContract.read.getTotalShares({ blockNumber: preBlock }),
      stethContract.getEvents.TransferShares(
        { from: address },
        { fromBlock, toBlock },
      ),
      stethContract.getEvents.TransferShares(
        { to: address },
        { fromBlock, toBlock },
      ),
      stethContract.getEvents.TokenRebased(
        {},
        {
          fromBlock,
          toBlock,
        },
      ),
    ]);

    const events = ([] as any).concat(
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
    // it's crucial to not cut corners here else computational error will be accumulated
    let currentTotalEther = baseTotalEther;
    let currentTotalShares = baseTotalShares;
    const sharesToSteth = (shares: bigint): bigint =>
      LidoSDKRewards.sharesToSteth(
        shares,
        currentTotalEther,
        currentTotalShares,
      );
    const getShareRate = () =>
      LidoSDKRewards.calcShareRate(currentTotalEther, currentTotalShares);

    let baseBalance = sharesToSteth(baseBalanceShares);
    let baseShareRate = getShareRate();

    let shareRate = baseShareRate;
    let prevSharesBalance = baseBalanceShares;
    type RewardEntry = Reward<RewardsChainEvents>;
    const rewards: Reward<RewardsChainEvents>[] = events.map((event) => {
      if (event.eventName === 'TransferShares') {
        const { from, to, sharesValue } = event.args;
        let type: RewardEntry['type'],
          changeShares: RewardEntry['changeShares'],
          balanceShares: RewardEntry['balanceShares'];

        if (to === address) {
          type = from === zeroAddress ? 'submit' : 'transfer_in';
          balanceShares = prevSharesBalance + sharesValue;
          changeShares = sharesValue;
        } else {
          type = to === withdrawalQueueAddress ? 'withdrawal' : 'transfer_out';
          balanceShares = prevSharesBalance - sharesValue;
          changeShares = -sharesValue;
        }

        return {
          type,
          balanceShares,
          changeShares,
          change: sharesToSteth(changeShares),
          balance: sharesToSteth(balanceShares),
          shareRate,
          originalEvent: event,
        };
      }
      if (event.eventName === 'TokenRebased') {
        const { postTotalEther, postTotalShares } = event.args;
        const oldBalance = sharesToSteth(prevSharesBalance);
        currentTotalEther = postTotalEther;
        currentTotalShares = postTotalShares;
        const newBalance = sharesToSteth(prevSharesBalance);
        shareRate = getShareRate();

        return {
          type: 'rebase',
          change: newBalance - oldBalance,
          changeShares: 0n,
          balance: newBalance,
          balanceShares: prevSharesBalance,
          shareRate,
          originalEvent: event,
        };
      }
      throw new Error('Impossible event type');
    });
    return {
      rewards,
      baseBalanceShares,
      baseShareRate,
      baseBalance,
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
      { getSubgraphUrl, address, fromBlock, toBlock, step = 1000 },
      withdrawalQueueAddress,
    ] = await Promise.all([
      this.parseProps(props),
      this.contractAddressWithdrawalQueue(),
    ]);
    const url = getSubgraphUrl(this.core.getSubgraphId(), this.core.chainId);

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
      totalRewards,
      { transfer: initialTransfer, rebase: initialRebase },
    ] = await Promise.all([
      getTransfers({
        url,
        address,
        fromBlock,
        toBlock: cappedToBlock,
        step,
      }),
      getTotalRewards({ url, fromBlock, toBlock: cappedToBlock, step }),
      getInitialData({ url, address, block: preBlock }),
    ]);

    const events = ([] as (TransferEventEntity | TotalRewardEntity)[]).concat(
      totalRewards,
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
      baseShareRate = LidoSDKRewards.calcShareRate(totalEther, totalShares);
      // we recount initial balance in case this rebase was after transfer
      // in opposite case recount will be the same value anyway
      prevBalance = LidoSDKRewards.sharesToSteth(
        prevBalanceShares,
        totalEther,
        totalShares,
      );
    }

    // fix values for return meta
    const baseBalance = prevBalance;
    const baseBalanceShares = prevBalanceShares;

    type RewardEntry = Reward<RewardsSubgraphEvents>;

    const rewards: Reward<RewardsSubgraphEvents>[] = events.map((event) => {
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
        let type: RewardEntry['type'],
          changeShares: RewardEntry['changeShares'],
          balanceShares: RewardEntry['balanceShares'],
          change: RewardEntry['change'],
          balance: RewardEntry['balance'];

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

        const shareRate = LidoSDKRewards.calcShareRate(
          BigInt(totalPooledEther),
          BigInt(totalShares),
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
        const { totalPooledEtherAfter, totalSharesAfter } = event;

        const totalEther = BigInt(totalPooledEtherAfter);
        const totalShares = BigInt(totalSharesAfter);
        const newBalance = LidoSDKRewards.sharesToSteth(
          prevBalanceShares,
          totalEther,
          totalShares,
        );
        const change = newBalance - prevBalance;
        prevBalance = newBalance;
        return {
          type: 'rebase',
          change,
          changeShares: 0n,
          balance: newBalance,
          balanceShares: prevBalanceShares,
          shareRate: LidoSDKRewards.calcShareRate(totalEther, totalShares),
          originalEvent: event,
        };
      }
      throw new Error('Impossible event');
    });

    return {
      rewards,
      baseBalance,
      lastIndexedBlock,
      baseBalanceShares,
      baseShareRate,
      fromBlock,
      toBlock: cappedToBlock,
    };
  }

  private async parseProps<TRewardsProps extends GetRewardsOptions>(
    props: TRewardsProps,
  ): Promise<
    Omit<TRewardsProps, 'toBlock' | 'fromBlock'> & {
      toBlock: bigint;
      fromBlock: bigint;
    }
  > {
    const toBlock = await this.toBlockNumber(props.toBlock ?? 'latest');
    if (props.fromBlock == undefined) {
      invariant(toBlock - props.blocksBack >= 0n, 'blockBack too far');
    }
    const fromBlock = await this.toBlockNumber(
      props.fromBlock ?? toBlock - props.blocksBack,
    );

    invariant(toBlock > fromBlock, 'toBlock is higher than fromBlock');

    return { ...props, fromBlock, toBlock };
  }

  @Logger('Utils:')
  private async toBlockNumber(
    block: bigint | NonPendingBlockTag,
  ): Promise<bigint> {
    if (typeof block === 'bigint') return block;
    const { number } = await this.core.rpcProvider.getBlock({
      blockTag: block,
    });
    invariant(number, 'block must not be pending');
    return number;
  }
}

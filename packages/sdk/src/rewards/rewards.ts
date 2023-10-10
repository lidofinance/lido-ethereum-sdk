import { LidoSDKCore } from '../core/index.js';
import { Logger, ErrorHandler, Cache } from '../common/decorators/index.js';
import { version } from '../version.js';
import {
  GetRewardsOptions,
  GetRewardsResult,
  LidoSDKRewardsProps,
  NonPendingBlockTag,
  Reward,
  RewardsEvents,
} from './types.js';
import invariant from 'tiny-invariant';
import { rewardsEventsAbi } from './abi/rewardsEvents.js';
import {
  Address,
  GetContractReturnType,
  PublicClient,
  getContract,
  zeroAddress,
} from 'viem';
import { LIDO_CONTRACT_NAMES } from '../common/constants.js';

export class LidoSDKRewards {
  readonly core: LidoSDKCore;
  private static readonly PRECISION = 10n ** 27n;
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
  ): Promise<GetRewardsResult> {
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
        { fromBlock: fromBlock, toBlock: toBlock },
      ),
      stethContract.getEvents.TransferShares(
        { to: address },
        { fromBlock: fromBlock, toBlock: toBlock },
      ),
      stethContract.getEvents.TokenRebased(undefined, {
        fromBlock: fromBlock,
        toBlock: toBlock,
      }),
    ]);

    const events = ([] as any[]).concat(
      transferInEvents,
      transferOutEvents,
      rebaseEvents,
    ) as RewardsEvents[];

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
      (shares * currentTotalEther * LidoSDKRewards.PRECISION) /
      currentTotalShares /
      LidoSDKRewards.PRECISION;
    const getShareRate = (): number =>
      Number(
        (currentTotalEther * LidoSDKRewards.PRECISION) / currentTotalShares,
      ) / Number(LidoSDKRewards.PRECISION);

    let baseBalance = sharesToSteth(baseBalanceShares);
    let baseShareRate = getShareRate();

    let shareRate = baseShareRate;
    let prevSharesBalance = baseBalanceShares;
    const rewards: Reward[] = events.map((event) => {
      if (event.eventName === 'TransferShares') {
        const { from, to, sharesValue } = event.args;
        let type: Reward['type'],
          changeShares: Reward['changeShares'],
          balanceShares: Reward['balanceShares'];

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

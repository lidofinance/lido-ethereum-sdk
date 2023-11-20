import { getContract } from 'viem';
import type {
  Address,
  GetContractReturnType,
  PublicClient,
  WalletClient,
} from 'viem';

import { Logger, Cache, ErrorHandler } from '../common/decorators/index.js';
import { LIDO_CONTRACT_NAMES } from '../common/constants.js';

import { StethEventsAbi } from './abi/stethEvents.js';
import {
  RebaseEvent,
  GetRebaseEventsProps,
  GetLastRebaseEventsProps,
} from './types.js';
import {
  ERROR_CODE,
  invariant,
  invariantArgument,
} from '../common/utils/sdk-error.js';
import { requestWithBlockStep } from '../rewards/utils.js';
import { LidoSDKModule } from '../common/class-primitives/sdk-module.js';

const BLOCKS_BY_DAY = 7600n;
const REBASE_EVENT_ABI_INDEX = 8;
const DAYS_LIMIT = 7;

export class LidoSDKStethEvents extends LidoSDKModule {
  static readonly DEFAULT_STEP_BLOCK = 50000;

  // Contracts

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['core.chain.id'])
  private async contractAddressStETH(): Promise<Address> {
    return await this.core.getContractAddress(LIDO_CONTRACT_NAMES.lido);
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['core.chain.id', 'contractAddressStETH'])
  private async getContractStETH(): Promise<
    GetContractReturnType<typeof StethEventsAbi, PublicClient, WalletClient>
  > {
    const address = await this.contractAddressStETH();

    return getContract({
      address,
      abi: StethEventsAbi,
      publicClient: this.core.rpcProvider,
    });
  }

  // Events

  @Logger('Events:')
  @ErrorHandler()
  public async getLastRebaseEvent(): Promise<RebaseEvent | undefined> {
    const events = await this.getLastRebaseEvents({ count: 1 });
    return events[0];
  }

  @Logger('Events:')
  @ErrorHandler()
  public async getFirstRebaseEvent(props: {
    days: number;
    fromBlockNumber?: bigint;
  }): Promise<RebaseEvent | undefined> {
    const { days } = props;
    const fromBlockNumber =
      props.fromBlockNumber ?? (await this.getLastBlock()).number;

    const contract = await this.getContractStETH();

    for (let day = 1; day <= DAYS_LIMIT; day++) {
      const from = fromBlockNumber - BigInt(days + 1 - day) * BLOCKS_BY_DAY;
      invariantArgument(from >= 0n, 'Days range precedes first block');
      const to = from + BLOCKS_BY_DAY;

      const logs = await this.core.rpcProvider.getLogs({
        address: contract.address,
        event: StethEventsAbi[REBASE_EVENT_ABI_INDEX],
        fromBlock: from,
        toBlock: to,
        strict: true,
      });
      if (logs.length > 0) return logs[0];
    }

    return undefined;
  }

  @Logger('Events:')
  @ErrorHandler()
  public async getLastRebaseEvents({
    count,
    stepBlock = LidoSDKStethEvents.DEFAULT_STEP_BLOCK,
  }: GetLastRebaseEventsProps): Promise<RebaseEvent[]> {
    invariantArgument(count, 'count must be a positive integer');
    const events = await this.getRebaseEvents({
      maxCount: count,
      back: { blocks: BLOCKS_BY_DAY * BigInt(count + 1) },
      stepBlock,
    });
    // most often scenario
    if (events.length === count) return events;
    const lastEvent = events.length > 0 ? events[events.length] : undefined;
    invariant(
      lastEvent,
      'Could not find any rebase events',
      ERROR_CODE.READ_ERROR,
    );
    const fromBlock =
      lastEvent.blockNumber - BigInt(DAYS_LIMIT) * BLOCKS_BY_DAY;
    const rest = await this.getRebaseEvents({
      maxCount: count - events.length,
      to: { block: lastEvent.blockNumber },
      from: { block: fromBlock > 0n ? fromBlock : 0n },
      stepBlock,
    });
    return events.concat(rest);
  }

  @Logger('Events:')
  @ErrorHandler()
  public async getRebaseEvents(
    props: GetRebaseEventsProps,
  ): Promise<RebaseEvent[]> {
    const [{ fromBlock, stepBlock, toBlock, maxCount }, contract] =
      await Promise.all([this.parseProps(props), this.getContractStETH()]);

    const logs = await requestWithBlockStep(
      stepBlock,
      fromBlock,
      toBlock,
      (fromBlock, toBlock) =>
        this.core.rpcProvider.getLogs({
          address: contract.address,
          event: StethEventsAbi[8],
          fromBlock,
          toBlock,
          strict: true,
        }),
    );

    return maxCount ? logs.slice(Math.max(logs.length - maxCount, 0)) : logs;
  }

  // Utils
  @Logger('Utils:')
  @ErrorHandler()
  private async getLastBlock() {
    const lastBlock = await this.core.rpcProvider.getBlock({
      blockTag: 'latest',
    });

    return lastBlock;
  }

  private async parseProps<TRebaseProps extends GetRebaseEventsProps>(
    props: TRebaseProps,
  ): Promise<
    Omit<
      TRebaseProps,
      'toBlock' | 'fromBlock' | 'includeZeroRebases' | 'step'
    > & {
      toBlock: bigint;
      fromBlock: bigint;
      stepBlock: number;
    }
  > {
    const toBlock = await this.core.toBlockNumber(
      props.to ?? { block: 'latest' },
    );
    const fromBlock = props.from
      ? await this.core.toBlockNumber(props.from)
      : await this.core.toBackBlock(props.back, toBlock);

    invariantArgument(toBlock >= fromBlock, 'toBlock is lower than fromBlock');

    const { stepBlock = LidoSDKStethEvents.DEFAULT_STEP_BLOCK, maxCount } =
      props;
    invariantArgument(stepBlock > 0, 'stepBlock must be a positive integer');
    if (maxCount !== undefined) {
      invariantArgument(maxCount > 0, 'maxCount must be a positive integer');
    }
    return {
      ...props,
      fromBlock,
      toBlock,
      stepBlock,
    };
  }
}

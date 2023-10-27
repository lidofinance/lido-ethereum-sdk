import { getContract } from 'viem';
import type {
  Address,
  GetContractReturnType,
  PublicClient,
  WalletClient,
} from 'viem';

import { LidoSDKCore } from '../core/index.js';
import { Logger, Cache, ErrorHandler } from '../common/decorators/index.js';
import { LIDO_CONTRACT_NAMES } from '../common/constants.js';
import { version } from '../version.js';

import { StethEventsAbi } from './abi/stethEvents.js';
import {
  type LidoSDKEventsProps,
  RebaseEvent,
  GetRebaseEventsProps,
} from './types.js';
import { invariantArgument } from '../common/utils/sdk-error.js';
import { requestWithBlockStep } from '../rewards/utils.js';

const BLOCKS_BY_DAY = 7600n;
const REBASE_EVENT_ABI_INDEX = 8;
const DAYS_LIMIT = 7;

export class LidoSDKStethEvents {
  static readonly DEFAULT_STEP_BLOCK = 50000;
  readonly core: LidoSDKCore;

  constructor(props: LidoSDKEventsProps) {
    const { core } = props;

    if (core) this.core = core;
    else this.core = new LidoSDKCore(props, version);
  }

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
    const contract = await this.getContractStETH();
    const lastBlock = await this.getLastBlock();

    for (let day = 1; day <= DAYS_LIMIT; day++) {
      const fromBlock = lastBlock.number - BLOCKS_BY_DAY * BigInt(day);
      const logs = await this.core.rpcProvider.getLogs({
        address: contract.address,
        event: StethEventsAbi[REBASE_EVENT_ABI_INDEX],
        fromBlock: fromBlock,
        toBlock: fromBlock + BLOCKS_BY_DAY,
        strict: true,
      });

      if (logs.length > 0) return logs[logs.length - 1];
    }

    return undefined;
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

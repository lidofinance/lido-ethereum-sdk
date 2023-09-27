import { getContract } from 'viem';
import {
  type Address,
  type GetContractReturnType,
  type PublicClient,
  type WalletClient,
} from 'viem';
import invariant from 'tiny-invariant';

import { LidoSDKCore } from '../core/index.js';
import { Logger, Cache, ErrorHandler } from '../common/decorators/index.js';
import { LIDO_CONTRACT_NAMES } from '../common/constants.js';
import { version } from '../version.js';

import { StethEventsAbi } from './abi/stethEvents.js';
import { type LidoSDKEventsProps } from './types.js';

const BLOCKS_BY_DAY = 7800n;

export class LidoSDKStethEvents {
  readonly core: LidoSDKCore;

  constructor(props: LidoSDKEventsProps) {
    const { core, ...rest } = props;

    if (core) this.core = core;
    else this.core = new LidoSDKCore(rest, version);
  }

  // Contracts

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['core.chain.id'])
  private async contractAddressStETH(): Promise<Address> {
    invariant(this.core.chain, 'Chain is not defined');

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
  public async getLastRebaseEvent() {
    const contract = await this.getContractStETH();
    const dayAgoBlock = await this.getBlockByDays({ days: 1 });
    const logs = await this.core.rpcProvider.getLogs({
      address: contract.address,
      event: StethEventsAbi[8],
      fromBlock: dayAgoBlock.number,
      toBlock: 'latest',
    });

    return logs[logs.length - 1];
  }

  @Logger('Events:')
  @ErrorHandler()
  public async getRebaseEventByDays(props: { days: number }) {
    const { days } = props;

    const contract = await this.getContractStETH();
    const lastEvent = await this.getLastRebaseEvent();
    const lastEventTimestamp = lastEvent?.args.reportTimestamp;
    invariant(lastEventTimestamp, 'lastEventTimestamp is not defined');

    const targetTimestamp = lastEventTimestamp - BigInt(days * 24 * 60 * 60);
    const block = await this.getBlockByDays({ days: 7 });

    const logs = await this.core.rpcProvider.getLogs({
      address: contract.address,
      event: StethEventsAbi[8],
      fromBlock: block.number,
      toBlock: 'latest',
    });

    const logsByDays = logs.filter((log) => {
      const timestamp = log.args.reportTimestamp;

      const diff = lastEventTimestamp - (timestamp || 0n);

      return diff < targetTimestamp;
    });

    return logsByDays;
  }

  @Logger('Events:')
  @ErrorHandler()
  public async getRebaseEvents(props: { count: number }) {
    const { count } = props;
    const contract = await this.getContractStETH();
    const block = await this.getBlockByDays({ days: count });
    const logs = await this.core.rpcProvider.getLogs({
      address: contract.address,
      event: StethEventsAbi[8],
      fromBlock: block.number,
      toBlock: 'latest',
    });

    return logs.slice(logs.length - count);
  }

  // Utils
  @Logger('Utils:')
  @ErrorHandler()
  public async getLastBlock() {
    const lastBlock = await this.core.rpcProvider.getBlock({
      blockTag: 'latest',
    });

    return lastBlock;
  }

  @Logger('Utils:')
  private async getBlockByDays(props: { days: number }) {
    const { days } = props;

    const lastBlock = await this.getLastBlock();
    const blockNumber = lastBlock.number - BLOCKS_BY_DAY * BigInt(days);
    const block = await this.core.rpcProvider.getBlock({
      blockNumber: blockNumber,
    });

    return block;
  }
}

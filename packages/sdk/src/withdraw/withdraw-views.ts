import { type Address } from 'viem';

import { Logger, Cache } from '../common/decorators/index.js';

import { BusModule } from './bus-module.js';
import { type RequestStatusWithId } from './types.js';
import { invariantArgument } from '../index.js';

export class LidoSDKWithdrawViews extends BusModule {
  // Views
  @Logger('Views:')
  public async getWithdrawalRequestsIds(props: {
    account: Address;
  }): Promise<readonly bigint[]> {
    const contract = await this.bus.contract.getContractWithdrawalQueue();

    return contract.read.getWithdrawalRequests([props.account]);
  }

  @Logger('Views:')
  public async getLastCheckpointIndex(): Promise<bigint> {
    const contract = await this.bus.contract.getContractWithdrawalQueue();

    return contract.read.getLastCheckpointIndex();
  }

  @Logger('Views:')
  public async getWithdrawalStatus(props: {
    requestsIds: readonly bigint[];
  }): Promise<readonly RequestStatusWithId[]> {
    const { requestsIds } = props;

    const contract = await this.bus.contract.getContractWithdrawalQueue();
    const requests = await contract.read.getWithdrawalStatus([requestsIds]);

    invariantArgument(
      requests.length === requestsIds.length,
      'Invalid requests ids',
    );

    return requests.map((request, i) => ({
      ...request,
      id: requestsIds[i] || BigInt(0),
      stringId: requestsIds[i]?.toString() || '0',
    }));
  }

  @Logger('Views:')
  public async findCheckpointHints(props: {
    sortedIds: bigint[];
    firstIndex?: bigint;
    lastIndex?: bigint;
  }): Promise<readonly bigint[]> {
    const { sortedIds, firstIndex = BigInt(1), lastIndex: _lastIndex } = props;

    const contract = await this.bus.contract.getContractWithdrawalQueue();

    const lastIndex = _lastIndex ?? (await this.getLastCheckpointIndex());
    return contract.read.findCheckpointHints([
      sortedIds,
      firstIndex,
      lastIndex,
    ]);
  }

  @Logger('Views:')
  public async getClaimableEther(props: {
    sortedIds: bigint[];
    hints: readonly bigint[];
  }): Promise<readonly bigint[]> {
    const { sortedIds, hints } = props;
    const contract = await this.bus.contract.getContractWithdrawalQueue();

    return contract.read.getClaimableEther([sortedIds, hints]);
  }

  @Logger('Views:')
  public async getUnfinalizedStETH(): Promise<bigint> {
    const contract = await this.bus.contract.getContractWithdrawalQueue();

    return contract.read.unfinalizedStETH();
  }

  // Constants

  @Logger('Views:')
  @Cache(30 * 60 * 1000, ['bus.core.chain.id'])
  public async minStethWithdrawalAmount(): Promise<bigint> {
    const contract = await this.bus.contract.getContractWithdrawalQueue();
    return contract.read.MIN_STETH_WITHDRAWAL_AMOUNT();
  }

  @Logger('Views:')
  public async minWStethWithdrawalAmount(): Promise<bigint> {
    const [amount, contract] = await Promise.all([
      this.minStethWithdrawalAmount(),
      this.bus.contract.getContractWstETH(),
    ]);
    return contract.read.getWstETHByStETH([amount]);
  }

  @Logger('Views:')
  @Cache(30 * 60 * 1000, ['bus.core.chain.id'])
  public async maxStethWithdrawalAmount(): Promise<bigint> {
    const contract = await this.bus.contract.getContractWithdrawalQueue();

    return contract.read.MAX_STETH_WITHDRAWAL_AMOUNT();
  }

  @Logger('Views:')
  public async maxWStethWithdrawalAmount(): Promise<bigint> {
    const [amount, contract] = await Promise.all([
      this.maxStethWithdrawalAmount(),
      this.bus.contract.getContractWstETH(),
    ]);
    return contract.read.getWstETHByStETH([amount]);
  }

  @Logger('Views:')
  public async isPaused(): Promise<boolean> {
    const contract = await this.bus.contract.getContractWithdrawalQueue();

    return contract.read.isPaused();
  }

  @Logger('Views:')
  public async isBunkerModeActive(): Promise<boolean> {
    const contract = await this.bus.contract.getContractWithdrawalQueue();

    return contract.read.isBunkerModeActive();
  }

  @Logger('Views:')
  public async isTurboModeActive(): Promise<boolean> {
    const [isBunkerMode, isPaused] = await Promise.all([
      this.isBunkerModeActive(),
      await this.isPaused(),
    ]);

    return !isPaused && !isBunkerMode;
  }
}

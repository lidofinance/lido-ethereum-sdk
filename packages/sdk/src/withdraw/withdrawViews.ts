import { type Address } from 'viem';
import invariant from 'tiny-invariant';

import { Logger, Cache } from '../common/decorators/index.js';
import { version } from '../version.js';
import { type LidoSDKCoreProps } from '../core/index.js';

import { Bus } from './bus.js';
import { type RequestStatusWithId } from './types.js';

export class LidoSDKWithdrawViews {
  private readonly bus: Bus;

  constructor(props: LidoSDKCoreProps & { bus?: Bus }) {
    if (props.bus) this.bus = props.bus;
    else this.bus = new Bus(props, version);
  }

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

    invariant(requests.length === requestsIds.length, 'Invalid requests ids');

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
    lastIndex: bigint;
  }): Promise<readonly bigint[]> {
    const { sortedIds, firstIndex = BigInt(1), lastIndex } = props;
    const contract = await this.bus.contract.getContractWithdrawalQueue();

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
  public async minStethWithdrawalAmount(): Promise<bigint> {
    const contract = await this.bus.contract.getContractWithdrawalQueue();

    return contract.read.MIN_STETH_WITHDRAWAL_AMOUNT();
  }

  @Logger('Views:')
  @Cache(30 * 60 * 1000, ['bus.core.chain.id'])
  public async maxStethWithdrawalAmount(): Promise<bigint> {
    const contract = await this.bus.contract.getContractWithdrawalQueue();

    return contract.read.MAX_STETH_WITHDRAWAL_AMOUNT();
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
    const isBunkerMode = await this.isBunkerModeActive();
    const isPaused = await this.isPaused();

    return !isPaused && !isBunkerMode;
  }
}

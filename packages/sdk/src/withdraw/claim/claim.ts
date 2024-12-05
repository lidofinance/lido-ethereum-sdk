import {
  encodeFunctionData,
  TransactionReceipt,
  decodeEventLog,
  getAbiItem,
  toEventHash,
} from 'viem';

import { Logger, ErrorHandler } from '../../common/decorators/index.js';
import type {
  NoTxOptions,
  PopulatedTransaction,
  TransactionOptions,
  TransactionResult,
} from '../../core/types.js';
import { NOOP } from '../../common/constants.js';

import { BusModule } from '../bus-module.js';
import type {
  ClaimRequestsProps,
  ClaimResult,
  ClaimResultEvent,
} from './types.js';
import { bigintComparator } from '../../common/utils/bigint-comparator.js';
import { invariantArgument } from '../../common/index.js';
import { PartialWithdrawalQueueEventsAbi } from '../abi/withdrawalQueue.js';

export class LidoSDKWithdrawClaim extends BusModule {
  // Precomputed event signatures
  private static CLAIM_SIGNATURE = toEventHash(
    getAbiItem({
      abi: PartialWithdrawalQueueEventsAbi,
      name: 'WithdrawalClaimed',
    }),
  );

  // Calls
  @Logger('Call:')
  @ErrorHandler()
  public async claimRequests(
    props: ClaimRequestsProps,
  ): Promise<TransactionResult<ClaimResult>> {
    const { account, callback = NOOP, ...rest } = props;
    const { requestsIds, hints } = await this.sortRequestsWithHints(
      props.requestsIds,
      props.hints,
    );
    const params = [requestsIds, hints] as const;
    const contract = await this.bus.contract.getContractWithdrawalQueue();
    return this.bus.core.performTransaction({
      ...rest,
      account,
      callback,
      getGasLimit: (options) =>
        contract.estimateGas.claimWithdrawals(params, options),
      sendTransaction: (options) =>
        contract.write.claimWithdrawals(params, options),
      decodeResult: (receipt) => this.decodeClaimEvents(receipt),
    });
  }

  @Logger('Views:')
  @ErrorHandler()
  public async claimRequestsEstimateGas(
    props: NoTxOptions<ClaimRequestsProps>,
    options?: TransactionOptions,
  ) {
    const account = await this.bus.core.useAccount(props.account);
    const { requestsIds, hints } = await this.sortRequestsWithHints(
      props.requestsIds,
      props.hints,
    );

    const contract = await this.bus.contract.getContractWithdrawalQueue();

    return contract.estimateGas.claimWithdrawals([requestsIds, hints], {
      account,
      ...options,
    });
  }

  @Logger('Views:')
  @ErrorHandler()
  public async claimRequestsSimulateTx(props: NoTxOptions<ClaimRequestsProps>) {
    const account = await this.bus.core.useAccount(props.account);
    const { requestsIds, hints } = await this.sortRequestsWithHints(
      props.requestsIds,
      props.hints,
    );

    const contract = await this.bus.contract.getContractWithdrawalQueue();

    return contract.simulate.claimWithdrawals([requestsIds, hints], {
      account,
    });
  }

  @Logger('Views:')
  @ErrorHandler()
  public async claimRequestsPopulateTx(
    props: NoTxOptions<ClaimRequestsProps>,
  ): Promise<PopulatedTransaction> {
    const account = await this.bus.core.useAccount(props.account);
    const { requestsIds, hints } = await this.sortRequestsWithHints(
      props.requestsIds,
      props.hints,
    );
    const contract = await this.bus.contract.getContractWithdrawalQueue();

    return {
      from: account.address,
      to: contract.address,
      data: encodeFunctionData({
        abi: contract.abi,
        functionName: 'claimWithdrawals',
        args: [requestsIds, hints],
      }),
    };
  }

  @Logger('Utils:')
  private async sortRequestsWithHints(
    requestsIds: readonly bigint[],
    hints?: readonly bigint[],
  ) {
    invariantArgument(requestsIds.length > 0, 'requests array is empty');
    if (hints) {
      return requestsIds
        .map((request, index) => {
          const hint = hints[index];
          invariantArgument(hint, 'Hints array does not match request array');
          return [request, hint] as const;
        })
        .sort(([r1], [r2]) => bigintComparator(r1, r2))
        .reduce(
          (acc, [request, hint]) => {
            acc.requestsIds.push(request);
            acc.hints.push(hint);
            return acc;
          },
          { requestsIds: [] as bigint[], hints: [] as bigint[] },
        );
    }
    const sortedRequestsIds = [...requestsIds].sort(bigintComparator);
    const fetchedHints = await this.bus.views.findCheckpointHints({
      sortedIds: sortedRequestsIds,
    });
    return {
      requestsIds: sortedRequestsIds,
      hints: fetchedHints,
    };
  }

  @Logger('Utils:')
  private async decodeClaimEvents(
    receipt: TransactionReceipt,
  ): Promise<ClaimResult> {
    const requests: ClaimResultEvent[] = [];
    for (const log of receipt.logs) {
      if (log.topics[0] !== LidoSDKWithdrawClaim.CLAIM_SIGNATURE) continue;
      const parsedLog = decodeEventLog({
        // fits both wsteth and steth events
        abi: PartialWithdrawalQueueEventsAbi,
        strict: true,
        ...log,
      });
      if (parsedLog.eventName === 'WithdrawalClaimed') {
        requests.push({ ...parsedLog.args });
      }
    }
    return { requests };
  }
}

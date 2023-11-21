import { encodeFunctionData, type SimulateContractReturnType } from 'viem';

import { Logger, ErrorHandler } from '../../common/decorators/index.js';
import type {
  NoCallback,
  PopulatedTransaction,
  TransactionResult,
} from '../../core/types.js';
import { NOOP } from '../../common/constants.js';

import { BusModule } from '../bus-module.js';
import type { ClaimRequestsProps } from './types.js';
import { invariantArgument } from '../../index.js';
import { bigintComparator } from '../../common/utils/bigint-comparator.js';

export class LidoSDKWithdrawClaim extends BusModule {
  // Calls
  @Logger('Call:')
  @ErrorHandler()
  public async claimRequests(
    props: ClaimRequestsProps,
  ): Promise<TransactionResult> {
    const { account, callback = NOOP } = props;
    const { requestsIds, hints } = await this.sortRequestsWithHints(
      props.requestsIds,
      props.hints,
    );
    const params = [requestsIds, hints] as const;
    const contract = await this.bus.contract.getContractWithdrawalQueue();
    return this.bus.core.performTransaction({
      account,
      callback,
      getGasLimit: (options) =>
        contract.estimateGas.claimWithdrawals(params, options),
      sendTransaction: (options) =>
        contract.write.claimWithdrawals(params, options),
    });
  }

  @Logger('Views:')
  @ErrorHandler()
  public async claimRequestsSimulateTx(
    props: NoCallback<ClaimRequestsProps>,
  ): Promise<SimulateContractReturnType> {
    const accountAddress = await this.bus.core.getWeb3Address(props.account);
    const { requestsIds, hints } = await this.sortRequestsWithHints(
      props.requestsIds,
      props.hints,
    );

    const contract = await this.bus.contract.getContractWithdrawalQueue();

    return contract.simulate.claimWithdrawals([requestsIds, hints], {
      account: accountAddress,
    });
  }

  @Logger('Views:')
  @ErrorHandler()
  public async claimRequestsPopulateTx(
    props: NoCallback<ClaimRequestsProps>,
  ): Promise<PopulatedTransaction> {
    const accountAddress = await this.bus.core.getWeb3Address(props.account);
    const { requestsIds, hints } = await this.sortRequestsWithHints(
      props.requestsIds,
      props.hints,
    );
    const contract = await this.bus.contract.getContractWithdrawalQueue();

    return {
      from: accountAddress,
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
}

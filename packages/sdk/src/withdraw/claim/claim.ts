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

export class LidoSDKWithdrawClaim extends BusModule {
  // Calls
  @Logger('Call:')
  @ErrorHandler()
  public async claimRequests(
    props: ClaimRequestsProps,
  ): Promise<TransactionResult> {
    const { account, callback = NOOP, requestsIds, hints: _hints } = props;
    const hints =
      _hints ??
      (await this.bus.views.findCheckpointHints({ sortedIds: requestsIds }));
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
    const { requestsIds } = props;
    const hints =
      props.hints ??
      (await this.bus.views.findCheckpointHints({
        sortedIds: props.requestsIds,
      }));

    const contract = await this.bus.contract.getContractWithdrawalQueue();

    return contract.simulate.claimWithdrawals([requestsIds, hints], {
      account: props.account,
    });
  }

  @Logger('Views:')
  @ErrorHandler()
  public async claimRequestsPopulateTx(
    props: NoCallback<ClaimRequestsProps>,
  ): Promise<PopulatedTransaction> {
    const { requestsIds } = props;
    const accountAddress = await this.bus.core.getWeb3Address(props.account);
    const hints =
      props.hints ??
      (await this.bus.views.findCheckpointHints({
        sortedIds: props.requestsIds,
      }));
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
}

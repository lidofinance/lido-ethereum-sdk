import { Logger, ErrorHandler } from '../../common/decorators/index.js';
import { TransactionResult } from '../../core/types.js';

import { BusModule } from '../bus-module.js';

import { ClaimRequestsProps } from './types.js';
import { NOOP } from '../../common/constants.js';

export class LidoSDKWithdrawClaim extends BusModule {
  // Calls
  @Logger('Call:')
  @ErrorHandler('Error:')
  public async claimRequests(
    props: ClaimRequestsProps,
  ): Promise<TransactionResult> {
    const { account, callback = NOOP, requestsIds, hints: _hints } = props;
    const hints =
      _hints ??
      (await this.bus.views.findCheckpointHints({ sortedIds: requestsIds }));
    const params = [requestsIds, hints] as const;
    const contract = await this.bus.contract.getContractWithdrawalQueue();
    return this.bus.core.performTransaction(
      {
        account,
        callback,
      },
      (options) => contract.estimateGas.claimWithdrawals(params, options),
      (options) => contract.write.claimWithdrawals(params, options),
    );
  }

  // TODO Populate/Simulate
}

import { Logger, ErrorHandler } from '../common/decorators/index.js';
import { ERROR_CODE, isBigint } from '../common/utils/index.js';

import { BusModule } from './bus-module.js';
import type {
  RequestStatusWithId,
  GetPendingRequestsInfoReturnType,
  PropsWithAccount,
  GetClaimableRequestsETHByAccountReturnType,
  GetClaimableRequestsInfoReturnType,
  GetWithdrawalRequestsInfoReturnType,
} from './types.js';

export class LidoSDKWithdrawRequestsInfo extends BusModule {
  // Utils

  @Logger('Utils:')
  @ErrorHandler()
  public async getWithdrawalRequestsInfo(
    props: PropsWithAccount,
  ): Promise<GetWithdrawalRequestsInfoReturnType> {
    const claimableInfo = await this.getClaimableRequestsInfo(props);
    const claimableETH = await this.getClaimableRequestsETHByAccount(props);
    const pendingInfo = await this.getPendingRequestsInfo(props);

    return {
      claimableInfo,
      pendingInfo,
      claimableETH,
    };
  }

  @Logger('Utils:')
  @ErrorHandler()
  public async getWithdrawalRequestsStatus(
    props: PropsWithAccount,
  ): Promise<readonly RequestStatusWithId[]> {
    const account = await this.bus.core.useAccount(props.account);
    const requestsIds = await this.bus.views.getWithdrawalRequestsIds({
      account,
    });

    return this.bus.views.getWithdrawalStatus({ requestsIds });
  }

  @Logger('Utils:')
  @ErrorHandler()
  public async getClaimableRequestsInfo(
    props: PropsWithAccount,
  ): Promise<GetClaimableRequestsInfoReturnType> {
    const requests = await this.getWithdrawalRequestsStatus(props);

    return requests.reduce(
      (acc, request) => {
        if (request.isFinalized && !request.isClaimed) {
          acc.claimableRequests.push(request);
          acc.claimableAmountStETH += request.amountOfStETH;
        }
        return acc;
      },
      {
        claimableRequests: [] as RequestStatusWithId[],
        claimableAmountStETH: 0n,
      },
    );
  }

  @Logger('Utils:')
  @ErrorHandler()
  public async getClaimableRequestsETHByIds(props: {
    claimableRequestsIds: (bigint | RequestStatusWithId)[];
  }): Promise<{
    ethByRequests: readonly bigint[];
    ethSum: bigint;
    hints: readonly bigint[];
  }> {
    const sortedIds = props.claimableRequestsIds
      .sort((aReq, bReq) => {
        if (isBigint(aReq) && isBigint(bReq)) {
          return aReq > bReq ? 1 : -1;
        }
        if (!isBigint(aReq) && !isBigint(bReq)) {
          return aReq.id > bReq.id ? 1 : -1;
        }

        throw this.bus.core.error({
          code: ERROR_CODE.INVALID_ARGUMENT,
          message: 'Mixing bigint types and object types',
        });
      })
      .map((req) => (isBigint(req) ? req : req.id));

    const hints = await this.bus.views.findCheckpointHints({
      sortedIds,
      lastIndex: await this.bus.views.getLastCheckpointIndex(),
    });

    const ethByRequests = await this.bus.views.getClaimableEther({
      sortedIds,
      hints,
    });
    const ethSum = ethByRequests.reduce((acc, eth) => acc + eth, BigInt(0));

    return { ethByRequests, ethSum, hints };
  }

  @Logger('Utils:')
  @ErrorHandler()
  public async getClaimableRequestsETHByAccount(
    props: PropsWithAccount,
  ): Promise<GetClaimableRequestsETHByAccountReturnType> {
    const requests = await this.getWithdrawalRequestsStatus(props);
    const claimableRequests = requests.filter((req) => req.isFinalized);
    const sortedRequests = claimableRequests.sort((aReq, bReq) =>
      aReq.id > bReq.id ? 1 : -1,
    );
    const sortedIds = sortedRequests.map((req) => req.id);

    const hints = await this.bus.views.findCheckpointHints({
      sortedIds,
      lastIndex: await this.bus.views.getLastCheckpointIndex(),
    });

    const ethByRequests = await this.bus.views.getClaimableEther({
      sortedIds,
      hints,
    });
    const ethSum = ethByRequests.reduce((acc, eth) => acc + eth, BigInt(0));

    return {
      ethByRequests,
      ethSum,
      hints,
      requests: sortedRequests,
      sortedIds,
    };
  }

  @Logger('Utils:')
  @ErrorHandler()
  public async getPendingRequestsInfo(
    props: PropsWithAccount,
  ): Promise<GetPendingRequestsInfoReturnType> {
    const requests = await this.getWithdrawalRequestsStatus(props);

    return requests.reduce(
      (acc, request) => {
        if (!request.isFinalized && !request.isClaimed) {
          acc.pendingRequests.push(request);
          acc.pendingAmountStETH += request.amountOfStETH;
        }
        return acc;
      },
      { pendingRequests: [], pendingAmountStETH: BigInt(0) } as {
        pendingRequests: RequestStatusWithId[];
        pendingAmountStETH: bigint;
      },
    );
  }
}

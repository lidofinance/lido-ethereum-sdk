import { type Address } from 'viem';

import { LidoSDKCore } from '../core/index.js';
import { Logger, Cache } from '../common/decorators/index.js';
import { isBigint } from '../common/utils/index.js';
import { version } from '../version.js';

import { LidoSDKWithdrawalsViews } from './withdrawalsViews.js';

import {
  type LidoSDKWithdrawalsRequestsInfoProps,
  type RequestStatusWithId,
} from './types.js';

export class LidoSDKWithdrawalsRequestsInfo {
  readonly core: LidoSDKCore;
  readonly views: LidoSDKWithdrawalsViews;

  constructor(props: LidoSDKWithdrawalsRequestsInfoProps) {
    const { core, views, ...rest } = props;

    if (core) this.core = core;
    else this.core = new LidoSDKCore(rest, version);

    if (views) this.views = views;
    else
      this.views = new LidoSDKWithdrawalsViews({
        ...props,
        core: this.core,
      });
  }

  // Utils

  @Logger('Utils:')
  @Cache(10 * 1000, ['core.chain.id'])
  public async getWithdrawalRequestsInfo(props: { account: Address }) {
    const { account } = props;

    const claimableInfo = await this.getClaimableRequestsInfo({ account });
    const claimableETH = await this.getClaimableRequestsETH({
      claimableRequestsIds: claimableInfo.claimableRequests,
    });
    const pendingInfo = await this.getPendingRequestsInfo({ account });

    return {
      claimableInfo,
      pendingInfo,
      claimableETH,
    };
  }

  @Logger('Utils:')
  @Cache(10 * 1000, ['core.chain.id'])
  public async getWithdrawalRequestsStatus(props: {
    account: Address;
  }): Promise<readonly RequestStatusWithId[]> {
    const requestsIds = await this.views.getWithdrawalRequestsIds({
      account: props.account,
    });

    return this.views.getWithdrawalStatus({ requestsIds });
  }

  @Logger('Utils:')
  @Cache(30 * 1000, ['core.chain.id'])
  public async getClaimableRequestsInfo(props: { account: Address }): Promise<{
    claimableRequests: RequestStatusWithId[];
    claimableAmountStETH: bigint;
  }> {
    const requests = await this.getWithdrawalRequestsStatus(props);

    return requests.reduce(
      (acc, request) => {
        if (request.isFinalized && !request.isClaimed) {
          acc.claimableRequests.push(request);
          acc.claimableAmountStETH += request.amountOfStETH;
        }
        return acc;
      },
      { claimableRequests: [], claimableAmountStETH: BigInt(0) } as {
        claimableRequests: RequestStatusWithId[];
        claimableAmountStETH: bigint;
      },
    );
  }

  @Logger('Utils:')
  @Cache(30 * 1000, ['core.chain.id'])
  public async getClaimableRequestsETH(props: {
    claimableRequestsIds: (bigint | RequestStatusWithId)[];
  }): Promise<{ ethByRequests: readonly bigint[]; ethSum: bigint }> {
    const sortedIds = props.claimableRequestsIds
      .sort((aReq, bReq) => {
        if (isBigint(aReq) && isBigint(bReq)) {
          return aReq > bReq ? 1 : -1;
        }
        if (!isBigint(aReq) && !isBigint(bReq)) {
          return aReq.id > bReq.id ? 1 : -1;
        }

        return 0;
      })
      .map((req) => (isBigint(req) ? req : req.id));

    const hints = await this.views.findCheckpointHints({
      sortedIds,
      lastIndex: await this.views.getLastCheckpointIndex(),
    });

    const ethByRequests = await this.views.getClaimableEther({
      sortedIds,
      hints,
    });
    const ethSum = ethByRequests.reduce((acc, eth) => acc + eth, BigInt(0));

    return { ethByRequests, ethSum };
  }

  @Logger('Utils:')
  @Cache(30 * 1000, ['core.chain.id'])
  public async getPendingRequestsInfo(props: { account: Address }): Promise<{
    pendingRequests: RequestStatusWithId[];
    pendingAmountStETH: bigint;
  }> {
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

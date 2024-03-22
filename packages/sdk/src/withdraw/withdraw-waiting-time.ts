import { Logger, ErrorHandler } from '../common/decorators/index.js';

import { BusModule } from './bus-module.js';
import type {
  WithdrawalWaitingTimeByAmountResponse,
  WithdrawalWaitingTimeRequestInfo,
  WithdrawalWaitingTimeByAmountParams,
  WithdrawalWaitingTimeByRequestIdsParams,
} from './types.js';
import { WQ_API_URLS } from '../common/index.js';
import { formatEther } from 'viem';
import {
  WithdrawalWaitingTimeByAmountOptions,
  WithdrawalWaitingTimeByRequestIdsOptions,
} from './types.js';

const endpoints = {
  calculateByAmount: '/v2/request-time/calculate',
  calculateByRequestId: '/v2/request-time',
};

export class LidoSDKWithdrawWaitingTime extends BusModule {
  // API call integrations
  @Logger('API:')
  @ErrorHandler()
  public async getWithdrawalWaitingTimeByAmount(
    props: WithdrawalWaitingTimeByAmountParams,
    options?: WithdrawalWaitingTimeByAmountOptions,
  ): Promise<WithdrawalWaitingTimeByAmountResponse> {
    const getWqApiURL = options?.getWqApiURL;

    const query = new URLSearchParams();
    if (props.amount) {
      query.set('amount', formatEther(props.amount));
    }

    const baseUrl =
      getWqApiURL && typeof getWqApiURL === 'function'
        ? getWqApiURL()
        : WQ_API_URLS[this.bus.core.chainId];

    const url = `${baseUrl}${endpoints.calculateByAmount}?${query.toString()}`;

    const response = await fetch(url, {
      headers: {
        'WQ-Request-Source': 'sdk',
      },
    });

    return response.json();
  }

  @Logger('API:')
  @ErrorHandler()
  public async getWithdrawalWaitingTimeByRequestIds(
    props: WithdrawalWaitingTimeByRequestIdsParams,
    options?: WithdrawalWaitingTimeByRequestIdsOptions,
  ): Promise<readonly WithdrawalWaitingTimeRequestInfo[]> {
    const requestDelay = options?.requestDelay ?? 1000;
    const getWqApiURL = options?.getWqApiURL;

    if (!Array.isArray(props.ids) || props.ids.length === 0) {
      throw new Error('expected not empty array ids');
    }

    const idsPages = [];
    const pageSize = 20;
    const baseUrl =
      getWqApiURL && typeof getWqApiURL === 'function'
        ? getWqApiURL()
        : WQ_API_URLS[this.bus.core.chainId];

    const path = `${baseUrl}${endpoints.calculateByRequestId}`;

    for (let i = 0; i < props.ids.length; i += pageSize) {
      idsPages.push(props.ids.slice(i, i + pageSize));
    }

    const result = [];

    for (const page of idsPages) {
      const query = new URLSearchParams();
      query.set('ids', page.toString());

      const url = `${path}?${query.toString()}`;

      const response = await fetch(url, {
        headers: {
          'WQ-Request-Source': 'sdk',
        },
      });

      const requests = await response.json();
      result.push(...requests);

      if (idsPages.length > 1) {
        // avoid backend spam
        await new Promise((resolve) => setTimeout(resolve, requestDelay));
      }
    }

    return result;
  }
}

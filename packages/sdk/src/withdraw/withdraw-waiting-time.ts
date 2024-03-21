import { Logger, ErrorHandler } from '../common/decorators/index.js';

import { BusModule } from './bus-module.js';
import type {
  WithdrawalWaitingTimeByAmountResponse,
  WithdrawalWaitingTimeRequestInfo,
  WithdrawalWaitingTimeByAmountParams,
  WithdrawalWaitingTimeByRequestIdsParams,
} from './types.js';
import { CHAINS } from '../common/index.js';
import { formatEther } from 'viem';

const urls = {
  [CHAINS.Mainnet]: 'https://wq-api.lido.fi',
  [CHAINS.Goerli]: 'https://wq-api.testnet.fi',
  [CHAINS.Holesky]: 'https://wq-api-holesky.testnet.fi',
};

const endpoints = {
  calculateByAmount: '/v2/request-time/calculate',
  calculateByRequestId: '/v2/request-time',
};

export class LidoSDKWithdrawWaitingTime extends BusModule {
  // Utils

  @Logger('Utils:')
  @ErrorHandler()
  public async getWithdrawalWaitingTimeByAmount(
    props: WithdrawalWaitingTimeByAmountParams,
  ): Promise<WithdrawalWaitingTimeByAmountResponse> {
    const query = new URLSearchParams();
    query.set('amount', formatEther(props.amount));
    const url =
      urls[this.bus.core.chainId] +
      endpoints.calculateByAmount +
      '?' +
      query.toString();

    const response = await fetch(url, {
      headers: {
        'WQ-Request-Source': 'sdk',
      },
    });

    return response.json();
  }

  @Logger('Utils:')
  @ErrorHandler()
  public async getWithdrawalWaitingTimeByRequestIds(
    props: WithdrawalWaitingTimeByRequestIdsParams,
  ): Promise<readonly WithdrawalWaitingTimeRequestInfo[]> {
    const idsPages = [];
    const pageSize = 20;
    const baseUrl =
      urls[this.bus.core.chainId] + endpoints.calculateByRequestId;

    for (let i = 0; i < props.ids.length; i += pageSize) {
      idsPages.push(props.ids.slice(i, i + pageSize));
    }

    const result = [];

    for (const page of idsPages) {
      const query = new URLSearchParams();
      query.set('ids', page.toString());

      const url = baseUrl + '?' + query.toString();

      const response = await fetch(url, {
        headers: {
          'WQ-Request-Source': 'sdk',
        },
      });

      const requests = await response.json();
      result.push(...requests);

      if (idsPages.length > 1) {
        // avoid backend spam
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return result;
  }
}

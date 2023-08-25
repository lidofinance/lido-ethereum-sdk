import { trackedFetchRpcFactory } from '@lidofinance/api-rpc';
import {
  DefaultErrorHandlerArgs,
  RequestWrapper,
  DEFAULT_API_ERROR_MESSAGE,
} from '@lidofinance/next-api-wrapper';
import getConfig from 'next/config';
import Metrics from 'utils/metrics';

export const enum CHAINS {
  Mainnet = 1,
  Goerli = 5,
}

const { serverRuntimeConfig } = getConfig();
const { infuraApiKey, alchemyApiKey } = serverRuntimeConfig;

export const rpcUrls: Record<CHAINS, [string, ...string[]]> = {
  '1': [
    `https://eth-mainnet.alchemyapi.io/v2/${alchemyApiKey}`,
    `https://mainnet.infura.io/v3/${infuraApiKey}`,
  ],
  '5': [
    `https://eth-goerli.alchemyapi.io/v2/${alchemyApiKey}`,
    `https://goerli.infura.io/v3/${infuraApiKey}`,
  ],
};

export const nextDefaultErrorHandler =
  (args?: DefaultErrorHandlerArgs): RequestWrapper =>
  async (req, res, next) => {
    const { errorMessage = DEFAULT_API_ERROR_MESSAGE, serverLogger: console } =
      args || {};
    try {
      await next?.(req, res, next);
    } catch (error) {
      const isInnerError = res.statusCode === 200;
      const status = isInnerError ? 500 : res.statusCode || 500;

      if (error instanceof Error) {
        const serverError = 'status' in error && (error.status as number);
        console?.error(error);
        res
          .status(serverError || status)
          .json({ message: 'something went wrong' });
      } else {
        res.status(status).json({ message: errorMessage });
      }
    }
  };

export const defaultErrorHandler = nextDefaultErrorHandler({
  serverLogger: console,
});

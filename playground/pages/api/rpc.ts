import { rpcFactory } from '@lidofinance/next-pages';
import { dynamics } from 'config';
import { wrapRequest as wrapNextRequest } from '@lidofinance/next-api-wrapper';
import { rpcUrls, defaultErrorHandler } from 'utils/rpc';
import Metrics from 'utils/metrics';
import { fetchRPC } from '@lido-sdk/fetch';

const rpc = rpcFactory({
  fetchRPC: fetchRPC as any,
  metrics: {
    prefix: '',
    registry: Metrics.registry,
  },
  serverLogger: console,
  allowedRPCMethods: [
    'test',
    'eth_call',
    'eth_gasPrice',
    'eth_getCode',
    'eth_estimateGas',
    'eth_getBlockByNumber',
    'eth_feeHistory',
    'eth_getBalance',
    'eth_blockNumber',
    'eth_getTransactionByHash',
    'eth_getTransactionReceipt',
    'eth_getTransactionCount',
    'eth_sendRawTransaction',
    'eth_getLogs',
    'eth_chainId',
    'net_version',
  ],
  defaultChain: `${dynamics.defaultChain}`,
  providers: rpcUrls,
});

export default wrapNextRequest([defaultErrorHandler])(rpc);

const path = require('path');
const dotenv = require('dotenv');
const ganache = require('ganache');

module.exports = async function () {
  dotenv.config({
    path: path.resolve(process.cwd(), '.env'),
  });

  const rpcUrl = process.env.TEST_RPC_URL;
  const chainId = Number(process.env.TEST_CHAIN_ID);

  const ganacheProvider = ganache.provider({
    fork: { url: rpcUrl },
    logging: { quiet: true },
    chain: { chainId, asyncRequestProcessing: true },
  });

  console.debug('\nInitializing ganache provider...');
  await ganacheProvider.initialize();
  console.debug('Initialized ganache provider OK');

  console.debug('Testing direct RPC provider...');
  const { result } = await fetch(rpcUrl, {
    method: 'POST',
    body: JSON.stringify({
      method: 'eth_chainId',
      params: [],
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((response) => response.json());
  if (Number(result) !== chainId) {
    throw new Error(`Invalid direct RPC provider response: ${result}`);
  }
  console.debug('Direct RPC provider OK');

  console.debug('Testing ganache fork RPC provider...');
  const testRequest = await ganacheProvider.request({
    method: 'eth_chainId',
    params: [],
  });
  if (Number(testRequest) !== chainId) {
    throw new Error(`Invalid ganache response: ${testRequest}`);
  }
  console.debug('Ganache fork RPC provider OK');

  globalThis.__ganache_provider__ = ganacheProvider;
};

const path = require('path');
const dotenv = require('dotenv');
const ganache = require('ganache');

const setupGanacheProvider = async (chainId, rpcUrl) => {
  const ganacheProvider = ganache.provider({
    fork: { url: rpcUrl },
    logging: { quiet: true },
    chain: { chainId, asyncRequestProcessing: true },
  });
  console.debug(`\n[${chainId}]Initializing ganache provider...`);
  await ganacheProvider.initialize();
  console.debug(`[${chainId}]Initialized ganache provider OK`);

  console.debug(`[${chainId}]Testing direct RPC provider...`);
  const { result } = await fetch(rpcUrl, {
    method: 'POST',
    body: JSON.stringify({
      method: 'eth_chainId',
      params: [],
      id: 1,
      jsonrpc: '2.0',
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((response) => response.json());
  if (parseInt(result, 16) !== chainId) {
    throw new Error(
      `[${chainId}]Invalid direct RPC provider response: ${result}`,
    );
  }
  console.debug(`[${chainId}]Direct RPC provider OK`);

  console.debug(`[${chainId}]Testing ganache fork RPC provider...`);
  const testRequest = await ganacheProvider.request({
    method: 'eth_chainId',
    params: [],
  });
  if (parseInt(testRequest, 16) !== chainId) {
    throw new Error(`[${chainId}]Invalid ganache response: ${testRequest}`);
  }
  console.debug(`[${chainId}]Ganache fork RPC provider OK`);
  return ganacheProvider;
};

module.exports = async function () {
  dotenv.config({
    path: path.resolve(process.cwd(), '.env'),
  });

  // L1
  const chainId = Number(process.env.TEST_CHAIN_ID);
  const rpcUrl = process.env.TEST_RPC_URL;
  globalThis.__ganache_provider__ = await setupGanacheProvider(chainId, rpcUrl);

  // L2
  // const l2RpcUrl = process.env.TEST_L2_RPC_URL;
  // const l2ChainId = Number(process.env.TEST_L2_CHAIN_ID);
  //
  // globalThis.__l2_ganache_provider__ = await setupGanacheProvider(
  //   l2ChainId,
  //   l2RpcUrl,
  // );
};

const path = require('path');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const ganache = require('ganache');

module.exports = async function () {
  if (!globalThis.fetch) {
    const g = globalThis;
    g.fetch = fetch.default;
    g.Headers = fetch.Headers;
    g.Request = fetch.Request;
    g.Response = fetch.Response;
  }

  dotenv.config({
    path: path.resolve(process.cwd(), '.env'),
  });

  const rpcUrl = process.env.TEST_RPC_URL;
  const chainId = Number(process.env.TEST_CHAIN_ID);

  const ganacheProvider = ganache.provider({
    fork: { url: rpcUrl },
    chain: { chainId, asyncRequestProcessing: false },
  });

  console.debug('Initializing ganache provider...');
  await ganacheProvider.initialize();
  console.debug('Initialized ganache provider');

  globalThis.__ganache_provider__ = ganacheProvider;
};

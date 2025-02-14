/** @type Record<number,string> */
export const rpcProviderUrls = {
  1: process.env[`RPC_PROVIDER_URL_1`],
  17000: process.env[`RPC_PROVIDER_URL_17000`],
  11155111: process.env[`RPC_PROVIDER_URL_11155111`],
  // Optimism
  10: process.env[`RPC_PROVIDER_URL_10`],
  // OP sepolia
  11155420: process.env[`RPC_PROVIDER_URL_11155420`],
  // Soneium Minato
  1946: process.env[`RPC_PROVIDER_URL_1946`],
  // Unichain
  1301: process.env[`RPC_PROVIDER_URL_1301`],
};
/** @type number */
export const defaultChain = parseInt(process.env.DEFAULT_CHAIN, 10) || 17000;
/** @type number[] */
export const supportedChains = process.env?.SUPPORTED_CHAINS?.split(',').map(
  (chainId) => parseInt(chainId, 10),
) ?? [17000, 11155111];
export const walletconnectProjectId = process.env.WALLETCONNECT_PROJECT_ID;

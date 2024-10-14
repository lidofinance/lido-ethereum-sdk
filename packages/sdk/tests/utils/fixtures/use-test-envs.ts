export const useTestsEnvs = () => {
  return {
    privateKey: process.env.TEST_PRIVATE_KEY as string,
    rpcUrl: process.env.TEST_RPC_URL as string,
    chainId: Number(process.env.TEST_CHAIN_ID),
    l2RpcUrl: process.env.TEST_L2_RPC_URL as string,
    l2ChainId: Number(process.env.TEST_L2_CHAIN_ID),
    skipSpendingTests: process.env.TEST_SKIP_SPENDING_TESTS == 'true',
    subgraphUrl: process.env.TEST_SUBGRAPH_URL,
  };
};

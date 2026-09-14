// The prool server started in global-setup proxies
// `http://127.0.0.1:<port>/<poolId>` to a dedicated, lazily-started Anvil fork
// per pool ID, so every Vitest worker gets its own isolated fork.
const getPoolId = () => process.env.VITEST_POOL_ID ?? '1';

export const useAnvilUrl = () =>
  `http://127.0.0.1:${process.env.VITEST_ANVIL_PORT}/${getPoolId()}`;

export const useL2AnvilUrl = () =>
  `http://127.0.0.1:${process.env.VITEST_L2_ANVIL_PORT}/${getPoolId()}`;

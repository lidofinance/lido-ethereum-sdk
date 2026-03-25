import { custom, http } from 'viem';
import { useTestsEnvs } from './use-test-envs.js';

export type MockTransportCallback = (
  args: any,
  originalRequest: (args?: any) => Promise<any>,
) => Promise<any>;

type MockTransportOptions = {
  useDirectRpc?: boolean;
};
// provides mockTransport to pass to Public/Wallet client
// async callback is called instead of provider.request
// first argument for callback is args as passed to provider.request
// second argument for callback is default request handler
// call it to invoke default handler with custom args if needed
// callback must return suitable rpc response
export const useMockTransport = (
  callback: MockTransportCallback,
  options: MockTransportOptions = {},
) => {
  const { useDirectRpc = false } = options;
  const { rpcUrl } = useTestsEnvs();
  const anvilUrl = `http://127.0.0.1:${process.env.VITEST_ANVIL_PORT}`;
  const baseUrl = useDirectRpc ? rpcUrl : anvilUrl;
  const originalRequest = (args: any) => http(baseUrl)({}).request(args);
  return custom({
    async request(args) {
      return callback(args, async (customArgs: any = args) =>
        originalRequest(customArgs),
      );
    },
  });
};

import { custom, http } from 'viem';
import { useTestRpcProvider } from './use-test-rpc-provider.js';
import { useTestsEnvs } from './use-test-envs.js';

type MockTransportCallback = (
  args: any,
  originalRequest: (args?: any) => Promise<any>,
) => Promise<any>;

type MockTransportOptions = {
  useDirectRpc?: boolean;
};

export const useMockTransport = (
  callback: MockTransportCallback,
  options: MockTransportOptions = {},
) => {
  const { useDirectRpc = false } = options;
  const { rpcUrl } = useTestsEnvs();
  const originalRequest: (args: any) => Promise<any> = useDirectRpc
    ? http(rpcUrl)({}).request
    : useTestRpcProvider().ganacheProvider.request;
  return custom({
    async request(args) {
      return callback(args, async (customArgs: any = args) =>
        originalRequest(customArgs),
      );
    },
  });
};

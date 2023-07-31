import { Provider, Web3Provider } from "@ethersproject/providers";

export type LidoSDKCoreProps = {
  chain: number;
  provider: Provider | Web3Provider;
};

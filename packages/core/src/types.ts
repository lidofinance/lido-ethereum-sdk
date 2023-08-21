import { WalletClient } from "viem";

import { SUPPORTED_CHAINS } from "./contants";

export type LidoSDKCoreProps = {
  chainId: (typeof SUPPORTED_CHAINS)[number];
  rpcUrls: string[];
  web3Provider?: WalletClient;
};

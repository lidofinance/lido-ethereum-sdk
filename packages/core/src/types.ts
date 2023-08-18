import { PublicClient, WalletClient } from "viem";

export type LidoSDKCoreProps = {
  chain: number;
  provider: PublicClient;
  web3Provider?: WalletClient;
};

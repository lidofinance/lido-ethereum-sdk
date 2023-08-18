import { CHAINS } from "@lido-sdk/constants";
import {
  type Address,
  type WalletClient,
  type PublicClient,
  type Account,
} from "viem";

import { getFeeData, FeeData } from "./common/utils/getFeeData";
import { ErrorHandler, Logger } from "./common/decorators";
import { LidoSDKCoreProps } from "./types";

const SUPPORTED_CHAINS = [1, 5];

const getSigner = (
  provider: WalletClient | PublicClient
): Account | undefined => {
  return provider.account;
};

export default class LidoSDKCore {
  protected chain: CHAINS.Mainnet | CHAINS.Goerli | undefined;
  protected signer: Account | undefined;
  protected provider: PublicClient | undefined;
  protected web3Provider: WalletClient | undefined;

  constructor(props: LidoSDKCoreProps) {
    const { chain, provider, web3Provider } = props;

    if (!SUPPORTED_CHAINS.includes(chain)) {
      throw new Error(`Unsupported chain: ${chain}`);
    }

    if (!provider) {
      throw new Error("Provider is required");
    }

    this.chain = chain;
    // TODO: think about batch provider
    this.provider = provider;
    this.web3Provider = web3Provider;
    this.signer = getSigner(provider);
  }

  // Balances

  @Logger("Balances:")
  public async balanceETH(address: Address): Promise<bigint> {
    if (!this.provider) {
      throw new Error("Provider is not defined");
    }
    return this.provider.getBalance({ address });
  }

  // utils

  @ErrorHandler("Utils:")
  @Logger("Utils:")
  public async getFeeData(): Promise<FeeData> {
    return getFeeData(this.provider!);
  }
}

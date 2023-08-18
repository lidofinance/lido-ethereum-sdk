import {
  Provider,
  Web3Provider,
  JsonRpcSigner,
} from "@ethersproject/providers";
import { BigNumber } from "@ethersproject/bignumber";
import { CHAINS } from "@lido-sdk/constants";

import { getFeeData, FeeData } from "./common/utils/getFeeData";
import { ErrorHandler, Logger } from "./common/decorators";
import { LidoSDKCoreProps } from "./types";

const SUPPORTED_CHAINS = [1, 5];

const getSigner = (
  provider: Provider | Web3Provider
): JsonRpcSigner | undefined => {
  if (provider instanceof Web3Provider) return provider.getSigner();

  return undefined;
};

export default class LidoSDKCore {
  protected chain: CHAINS.Mainnet | CHAINS.Goerli | undefined;
  protected signer: JsonRpcSigner | undefined;
  protected provider: Provider | Web3Provider | undefined;

  constructor(props: LidoSDKCoreProps) {
    const { chain, provider } = props;

    if (!SUPPORTED_CHAINS.includes(chain)) {
      throw new Error(`Unsupported chain: ${chain}`);
    }

    if (!provider) {
      throw new Error("Provider is required");
    }

    this.chain = chain;
    // TODO: think about batch provider
    this.provider = provider;
    this.signer = getSigner(provider);
  }

  // Balances

  @Logger("Balances:")
  public balanceETH(address: string): Promise<BigNumber> {
    return this.provider!.getBalance(address);
  }

  // utils

  @ErrorHandler("Utils:")
  @Logger("Utils:")
  public async getFeeData(): Promise<FeeData> {
    return getFeeData(this.provider!);
  }
}

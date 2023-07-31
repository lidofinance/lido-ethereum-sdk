import {
  Provider,
  Web3Provider,
  JsonRpcSigner,
} from "@ethersproject/providers";
import { BigNumberish } from "ethers";

import { LidoSDKCoreProps } from "@/types";

const SUPPORTED_CHAINS = [1, 5];

const getSigner = (
  provider: Provider | Web3Provider
): JsonRpcSigner | undefined => {
  if (provider instanceof Web3Provider) return provider.getSigner();

  return undefined;
};

export class LidoSDKCore {
  protected chain: number | undefined;
  protected provider: Provider | Web3Provider | undefined;
  protected signer: JsonRpcSigner | undefined;

  constructor(props: LidoSDKCoreProps) {
    const { chain, provider } = props;

    if (!SUPPORTED_CHAINS.includes(chain)) {
      throw new Error(`Unsupported chain: ${chain}`);
    }

    if (!provider) {
      throw new Error("Provider is required");
    }

    this.chain = chain;
    this.provider = provider;
    this.signer = getSigner(provider);
  }

  balanceETH(): Promise<BigNumberish> {
    return this.provider!.getBalance(this.signer!.getAddress());
  }
}

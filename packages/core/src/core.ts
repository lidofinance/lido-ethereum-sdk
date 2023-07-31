import {
  Provider,
  Web3Provider,
  JsonRpcSigner,
} from "@ethersproject/providers";
import { BigNumber } from "@ethersproject/bignumber";
import { getSTETHContract, StethAbi } from "@lido-sdk/contracts";
import { getTokenAddress, CHAINS, TOKENS } from "@lido-sdk/constants";

import { getFeeData, FeeData } from "@common/utils/getFeeData";
import { Logger } from "@common/utils/decorators";
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
    // TODO: think about batch provider
    this.provider = provider;
    this.signer = getSigner(provider);
  }

  // Contracts

  @Logger("Contracts:")
  public contractAddressStETH(): string {
    return getTokenAddress(CHAINS.Mainnet, TOKENS.STETH);
  }

  @Logger("Contracts:")
  public contractStETH(): StethAbi {
    return getSTETHContract(this.contractAddressStETH(), this.provider!);
  }

  // Balances

  @Logger("Balances:")
  public balanceETH(address: string): Promise<BigNumber> {
    return this.provider!.getBalance(address);
  }

  @Logger("Balances:")
  public balanceStETH(address: string): Promise<BigNumber> {
    return this.contractStETH().balanceOf(address);
  }

  // utils

  @Logger("Utils:")
  public async getFeeData(): Promise<FeeData> {
    return getFeeData(this.provider!);
  }
}

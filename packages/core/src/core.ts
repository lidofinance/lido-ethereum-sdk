import {
  type Address,
  type WalletClient,
  type PublicClient,
  type Chain,
  createPublicClient,
  createWalletClient,
  fallback,
  http,
  custom,
} from "viem";
import { goerli, mainnet } from "viem/chains";
import invariant from "tiny-invariant";

import { getFeeData, FeeData } from "./common/utils/getFeeData";
import { ErrorHandler, Logger, Initialize } from "./common/decorators";
import { SUPPORTED_CHAINS } from "./contants";
import { LidoSDKCoreProps } from "./types";

export default class LidoSDKCore {
  readonly chainId: (typeof SUPPORTED_CHAINS)[number] | undefined;
  readonly rpcUrls: string[] = [];
  readonly rpcProvider: PublicClient | undefined;
  readonly web3Provider: WalletClient | undefined;
  readonly chain: Chain | undefined;

  constructor(props: LidoSDKCoreProps, version?: string) {
    const { chain, chainId, rpcUrls, rpcProvider, web3Provider } = this.init(
      props,
      version
    );

    this.chainId = chainId;
    this.chain = chain;
    this.rpcUrls = rpcUrls;
    this.rpcProvider = rpcProvider;
    this.web3Provider = web3Provider;
  }

  @Initialize("Init:")
  @Logger("LOG:")
  private init(props: LidoSDKCoreProps, _version?: string) {
    const { chainId, rpcUrls, web3Provider } = props;

    if (!SUPPORTED_CHAINS.includes(chainId)) {
      throw new Error(`Unsupported chain: ${chainId}`);
    }

    if (rpcUrls.length === 0) {
      throw new Error("rpcUrls is required");
    }

    const chain = chainId === 1 ? mainnet : goerli;

    return {
      chainId,
      chain,
      rpcUrls,
      rpcProvider: this.createRpcProvider(chain, rpcUrls),
      web3Provider: web3Provider ?? this.createWeb3Provider(chain),
    };
  }

  // Provider

  @Logger("Provider:")
  public createRpcProvider(chain: Chain, rpcUrls: string[]): PublicClient {
    if (!this.rpcProvider) {
      const rpcs = rpcUrls.map((url) => http(url));

      return createPublicClient({
        batch: {
          multicall: true,
        },
        chain,
        transport: fallback(rpcs),
      });
    }
    return this.rpcProvider;
  }

  @Logger("Provider:")
  public createWeb3Provider(chain: Chain): WalletClient {
    if (!this.web3Provider) {
      return createWalletClient({
        chain,
        // TODO: fix type
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        transport: custom(window.ethereum),
      });
    }

    return this.web3Provider;
  }

  // Balances

  @Logger("Balances:")
  public async balanceETH(address: Address): Promise<bigint> {
    invariant(this.rpcProvider, "RPC provider is not defined");

    return this.rpcProvider.getBalance({ address });
  }

  // utils

  @ErrorHandler("Utils:")
  @Logger("Utils:")
  public async getFeeData(): Promise<FeeData> {
    invariant(this.rpcProvider, "RPC provider is not defined");

    return getFeeData(this.rpcProvider);
  }

  @ErrorHandler("Utils:")
  @Logger("Utils:")
  public async getWeb3Address(): Promise<Address> {
    invariant(this.web3Provider, "Web3 provider is not defined");

    if (this.web3Provider.account) return this.web3Provider.account.address;
    if ("getAddresses" in this.web3Provider) {
      const [address] = await this.web3Provider.getAddresses();
      invariant(address, "Web3 address is not defined");

      return address;
    }

    // TODO: fix type
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const [account] = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    invariant(account, "Web3 address is not defined");

    return account;
  }
}

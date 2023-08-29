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

import {
  getFeeData,
  type FeeData,
  checkIsContract,
  SDKError,
  type SDKErrorProps,
  getErrorMessage,
  type ErrorMessage,
} from "../common/utils/index.js";
import {
  ErrorHandler,
  Logger,
  Initialize,
  Cache,
} from "../common/decorators/index.js";
import { SUPPORTED_CHAINS } from "../common/constants.js";

import { LidoSDKCoreProps } from "./types.js";

export default class LidoSDKCore {
  readonly chainId: (typeof SUPPORTED_CHAINS)[number];
  readonly rpcUrls: string[] | undefined;
  readonly chain: Chain;
  readonly rpcProvider: PublicClient;
  public web3Provider: WalletClient | undefined;

  constructor(props: LidoSDKCoreProps, version?: string) {
    const { chain, rpcProvider, web3Provider } = this.init(props, version);

    this.chainId = props.chainId;
    this.chain = chain;
    this.rpcUrls = props.rpcUrls;
    this.rpcProvider = rpcProvider;
    this.web3Provider = web3Provider;
  }

  @Initialize("Init:")
  @Logger("LOG:")
  private init(props: LidoSDKCoreProps, _version?: string) {
    const { chainId, rpcUrls, web3Provider, rpcProvider } = props;

    if (!SUPPORTED_CHAINS.includes(chainId)) {
      throw new Error(`Unsupported chain: ${chainId}`);
    }

    if (!rpcProvider && rpcUrls.length === 0) {
      throw new Error("rpcUrls is required");
    }

    if (!rpcUrls && !rpcProvider) {
      throw new Error("rpcUrls or rpcProvider is required");
    }

    const chain = chainId === 1 ? mainnet : goerli;
    const currentRpcProvider =
      rpcProvider ?? this.createRpcProvider(chain, rpcUrls);
    const currentWeb3Provider = web3Provider;

    return {
      chain,
      rpcProvider: currentRpcProvider,
      web3Provider: currentWeb3Provider,
    };
  }

  // Provider

  @Logger("Provider:")
  public createRpcProvider(chain: Chain, rpcUrls: string[]): PublicClient {
    const rpcs = rpcUrls.map((url) => http(url));

    return createPublicClient({
      batch: {
        multicall: true,
      },
      chain,
      transport: fallback(rpcs),
    });
  }

  @Logger("Provider:")
  public createWeb3Provider(chain: Chain): WalletClient {
    return createWalletClient({
      chain,
      // TODO: fix type
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      transport: custom(window.ethereum),
    });
  }

  @Logger("Provider:")
  public defineWeb3Provider(): WalletClient {
    invariant(!this.web3Provider, "Web3 provider is already defined");

    this.web3Provider = this.createWeb3Provider(this.chain);

    return this.web3Provider;
  }

  @Logger("Provider:")
  public setWeb3Provider(web3Provider: WalletClient): void {
    invariant(web3Provider.chain === this.chain, "Wrong chain");

    this.web3Provider = web3Provider;
  }
  // Balances

  @Logger("Balances:")
  @Cache(10 * 1000, ["chain.id"])
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
    // For walletconnect
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

  @ErrorHandler("Utils:")
  @Logger("Utils:")
  @Cache(60 * 60 * 1000, ["chain.id"])
  public async isContract(address: Address): Promise<boolean> {
    invariant(this.rpcProvider, "RPC provider is not defined");
    const { isContract } = await checkIsContract(this.rpcProvider, address);

    return isContract;
  }

  @ErrorHandler("Utils:")
  @Logger("Utils:")
  public error(props: SDKErrorProps): SDKError {
    return new SDKError(props);
  }

  @ErrorHandler("Utils:")
  @Logger("Utils:")
  public getErrorMessage(error: unknown): {
    message: ErrorMessage;
    code: string | number;
  } {
    return getErrorMessage(error);
  }
}

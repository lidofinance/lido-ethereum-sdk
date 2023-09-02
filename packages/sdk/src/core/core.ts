import {
  type Address,
  type WalletClient,
  type PublicClient,
  type Chain,
  type GetContractReturnType,
  createPublicClient,
  createWalletClient,
  fallback,
  http,
  custom,
  getContract,
} from 'viem';
import { goerli, mainnet } from 'viem/chains';
import invariant from 'tiny-invariant';

import {
  getFeeData,
  type FeeData,
  checkIsContract,
  SDKError,
  type SDKErrorProps,
  getErrorMessage,
  type ErrorMessage,
} from '../common/utils/index.js';
import { Logger, Initialize, Cache } from '../common/decorators/index.js';
import {
  SUPPORTED_CHAINS,
  LIDO_LOCATOR_BY_CHAIN,
  type CHAINS,
  type LIDO_CONTRACT_NAMES,
} from '../common/constants.js';

import { LidoLocatorAbi } from './abi/lidoLocator.js';
import { wqAbi } from './abi/wq.js';
import { LidoSDKCoreProps } from './types.js';

export default class LidoSDKCore {
  readonly chainId: CHAINS;
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

  @Initialize('Init:')
  @Logger('LOG:')
  private init(props: LidoSDKCoreProps, _version?: string) {
    const { chainId, rpcUrls, web3Provider, rpcProvider } = props;

    if (!SUPPORTED_CHAINS.includes(chainId)) {
      throw new Error(`Unsupported chain: ${chainId}`);
    }

    if (!rpcProvider && rpcUrls.length === 0) {
      throw new Error('rpcUrls is required');
    }

    if (!rpcUrls && !rpcProvider) {
      throw new Error('rpcUrls or rpcProvider is required');
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

  @Logger('Provider:')
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

  @Logger('Provider:')
  public createWeb3Provider(chain: Chain): WalletClient {
    return createWalletClient({
      chain,
      // TODO: fix type
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      transport: custom(window.ethereum),
    });
  }

  @Logger('Provider:')
  public defineWeb3Provider(): WalletClient {
    invariant(!this.web3Provider, 'Web3 provider is already defined');

    this.web3Provider = this.createWeb3Provider(this.chain);

    return this.web3Provider;
  }

  @Logger('Provider:')
  public setWeb3Provider(web3Provider: WalletClient): void {
    invariant(web3Provider.chain === this.chain, 'Wrong chain');

    this.web3Provider = web3Provider;
  }
  // Balances

  @Logger('Balances:')
  @Cache(10 * 1000, ['chain.id'])
  public async balanceETH(address: Address): Promise<bigint> {
    invariant(this.rpcProvider, 'RPC provider is not defined');

    return this.rpcProvider.getBalance({ address });
  }

  // Contracts

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['chain.id'])
  public contractAddressLidoLocator(): Address {
    invariant(this.chain, 'Chain is not defined');

    return LIDO_LOCATOR_BY_CHAIN[this.chain.id as CHAINS];
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['chain.id', 'contractAddressLidoLocator'])
  public getContractLidoLocator(): GetContractReturnType<
    typeof LidoLocatorAbi,
    PublicClient,
    WalletClient
  > {
    return getContract({
      address: this.contractAddressLidoLocator(),
      abi: LidoLocatorAbi,
      publicClient: this.rpcProvider,
      walletClient: this.web3Provider,
    });
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['chain.id'])
  private getContractWQ(
    address: Address,
  ): GetContractReturnType<typeof wqAbi, PublicClient> {
    return getContract({
      address,
      abi: wqAbi,
      publicClient: this.rpcProvider,
    });
  }

  // Utils

  @Logger('Utils:')
  public async getFeeData(): Promise<FeeData> {
    invariant(this.rpcProvider, 'RPC provider is not defined');

    return getFeeData(this.rpcProvider);
  }

  @Logger('Utils:')
  public async getWeb3Address(): Promise<Address> {
    invariant(this.web3Provider, 'Web3 provider is not defined');

    if (this.web3Provider.account) return this.web3Provider.account.address;
    // For walletconnect
    if ('getAddresses' in this.web3Provider) {
      const [address] = await this.web3Provider.getAddresses();
      invariant(address, 'Web3 address is not defined');

      return address;
    }

    // TODO: fix type
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const [account] = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    invariant(account, 'Web3 address is not defined');

    return account;
  }

  @Logger('Utils:')
  @Cache(60 * 60 * 1000, ['chain.id'])
  public async isContract(address: Address): Promise<boolean> {
    invariant(this.rpcProvider, 'RPC provider is not defined');
    const { isContract } = await checkIsContract(this.rpcProvider, address);

    return isContract;
  }

  @Logger('Utils:')
  public error(props: SDKErrorProps): SDKError {
    return new SDKError(props);
  }

  @Logger('Utils:')
  public getErrorMessage(error: unknown): {
    message: ErrorMessage;
    code: string | number;
  } {
    return getErrorMessage(error);
  }

  @Logger('Utils:')
  @Cache(30 * 60 * 1000, ['chain.id'])
  public async getContractAddress(
    contract: LIDO_CONTRACT_NAMES,
  ): Promise<Address> {
    invariant(this.rpcProvider, 'RPC provider is not defined');
    const lidoLocator = this.getContractLidoLocator();

    invariant(lidoLocator, 'Lido locator is not defined');

    if (contract === 'wsteth') {
      const withdrawalQueue = await lidoLocator.read.withdrawalQueue();
      const contract = await this.getContractWQ(withdrawalQueue);
      const wstethAddress = await contract.read.WSTETH?.();

      invariant(wstethAddress, 'wstETH address is not defined');

      return wstethAddress as Address;
    } else {
      invariant(lidoLocator.read[contract], 'Lido locator read is not defined');

      return lidoLocator.read[contract]();
    }
  }
}

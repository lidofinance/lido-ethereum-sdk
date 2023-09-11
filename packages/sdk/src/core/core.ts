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
  isHex,
  numberToHex,
  stringify,
  maxUint256,
} from 'viem';
import { goerli, mainnet } from 'viem/chains';
import invariant from 'tiny-invariant';
import { splitSignature } from '@ethersproject/bytes';

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
  LIDO_CONTRACT_NAMES,
  CONTRACTS_BY_TOKENS,
  LIDO_TOKENS,
} from '../common/constants.js';

import { LidoLocatorAbi } from './abi/lidoLocator.js';
import { wqAbi } from './abi/wq.js';
import {
  type LidoSDKCoreProps,
  type PermitSignature,
  type SignPermitProps,
} from './types.js';
import { permitAbi } from './abi/permit.js';

const EIP2612_TYPE = [
  { name: 'owner', type: 'address' },
  { name: 'spender', type: 'address' },
  { name: 'value', type: 'uint256' },
  { name: 'nonce', type: 'uint256' },
  { name: 'deadline', type: 'uint256' },
];

const TYPES = {
  EIP712Domain: [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    {
      name: 'chainId',
      type: 'uint256',
    },
    {
      name: 'verifyingContract',
      type: 'address',
    },
  ],
  Permit: EIP2612_TYPE,
};

export default class LidoSDKCore {
  public static readonly INFINITY_DEADLINE_VALUE = maxUint256;
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

  // PERMIT
  @Logger('Permit:')
  public async signPermit(props: SignPermitProps): Promise<PermitSignature> {
    const {
      token,
      amount,
      account,
      spender,
      deadline = LidoSDKCore.INFINITY_DEADLINE_VALUE,
    } = props;
    invariant(this.web3Provider, 'Web3 provider is not defined');

    const { contract, domain } = await this.getPermitContractData(token);
    const nonce = await contract.read.nonces([account]);

    const message = {
      owner: account,
      spender,
      value: amount.toString(),
      nonce: numberToHex(nonce),
      deadline: numberToHex(deadline),
    };
    const typedData = stringify(
      { domain, primaryType: 'Permit', types: TYPES, message },
      (_, value) => (isHex(value) ? value.toLowerCase() : value),
    );

    const signature = await this.web3Provider.request({
      method: 'eth_signTypedData_v4',
      params: [account, typedData],
    });
    const { s, r, v } = splitSignature(signature);

    return {
      v,
      r: r as `0x${string}`,
      s: s as `0x${string}`,
      value: amount,
      deadline,
      chainId: BigInt(this.chain.id),
      nonce: message.nonce,
      owner: account,
      spender,
    };
  }

  // Utils

  @Logger('Utils:')
  @Cache(30 * 60 * 1000, ['chain.id'])
  private async getPermitContractData(token: SignPermitProps['token']) {
    const tokenAddress = await this.getContractAddress(
      CONTRACTS_BY_TOKENS[token],
    );
    const contract = getContract({
      address: tokenAddress,
      abi: permitAbi,
      publicClient: this.rpcProvider,
      walletClient: this.web3Provider,
    });

    let domain = {
      name: 'Wrapped liquid staked Ether 2.0',
      version: '1',
      chainId: this.chain.id,
      verifyingContract: tokenAddress,
    };
    if (token === LIDO_TOKENS.steth) {
      const [name, version, chainId, verifyingContract] =
        await contract.read.eip712Domain();
      domain = {
        name,
        version,
        chainId: Number(chainId),
        verifyingContract,
      };
    }
    return {
      contract,
      domain,
    };
  }

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

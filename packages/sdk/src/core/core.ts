import {
  type Address,
  type WalletClient,
  type PublicClient,
  type Chain,
  type GetContractReturnType,
  type CustomTransportConfig,
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
import invariant from 'tiny-invariant';
import { splitSignature } from '@ethersproject/bytes';

import {
  type FeeData,
  type SDKErrorProps,
  type ErrorMessage,
  getFeeData,
  checkIsContract,
  SDKError,
  getErrorMessage,
} from '../common/utils/index.js';
import { Logger, Initialize, Cache } from '../common/decorators/index.js';
import {
  SUPPORTED_CHAINS,
  LIDO_LOCATOR_BY_CHAIN,
  type CHAINS,
  LIDO_CONTRACT_NAMES,
  CONTRACTS_BY_TOKENS,
  LIDO_TOKENS,
  PERMIT_MESSAGE_TYPES,
  VIEM_CHAINS,
  SUBRGRAPH_ID_BY_CHAIN,
} from '../common/constants.js';

import { LidoLocatorAbi } from './abi/lidoLocator.js';
import { wqAbi } from './abi/wq.js';
import {
  type LidoSDKCoreProps,
  type PermitSignature,
  type SignPermitProps,
  type LOG_MODE,
  type PerformTransactionOptions,
  type TransactionOptions,
  type TransactionResult,
  TransactionCallbackStage,
} from './types.js';
import { permitAbi } from './abi/permit.js';

export default class LidoSDKCore {
  public static readonly INFINITY_DEADLINE_VALUE = maxUint256;

  private _web3Provider: WalletClient | undefined;

  readonly chainId: CHAINS;
  readonly rpcUrls: string[] | undefined;
  readonly chain: Chain;
  readonly rpcProvider: PublicClient;
  readonly logMode: LOG_MODE;

  public get web3Provider(): WalletClient | undefined {
    return this._web3Provider;
  }

  constructor(props: LidoSDKCoreProps, version?: string) {
    const { chain, rpcProvider, web3Provider } = this.init(props, version);

    this.chainId = props.chainId;
    this.chain = chain;
    this.rpcUrls = props.rpcUrls;
    this.rpcProvider = rpcProvider;
    this._web3Provider = web3Provider;
    this.logMode = props.logMode ?? 'info';
  }

  // Static Provider Creation

  public static createRpcProvider(
    chain: Chain,
    rpcUrls: string[],
  ): PublicClient {
    const rpcs = rpcUrls.map((url) => http(url));

    return createPublicClient({
      batch: {
        multicall: true,
      },
      chain,
      transport: fallback(rpcs),
    });
  }

  public static createWeb3Provider(
    chain: Chain,
    transport: { request(...args: any): Promise<any> },
    transportConfig?: CustomTransportConfig,
  ): WalletClient {
    return createWalletClient({
      chain,
      transport: custom(transport, transportConfig),
    });
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

    const chain = VIEM_CHAINS[chainId];
    const currentRpcProvider =
      rpcProvider ?? LidoSDKCore.createRpcProvider(chain, rpcUrls);
    const currentWeb3Provider = web3Provider;

    return {
      chain,
      rpcProvider: currentRpcProvider,
      web3Provider: currentWeb3Provider,
    };
  }

  // Web 3 provider

  @Logger('Provider:')
  public setWeb3Provider(web3Provider: WalletClient): void {
    invariant(web3Provider.chain === this.chain, 'Wrong chain');
    this._web3Provider = web3Provider;
  }

  @Logger('Provider:')
  public useWeb3Provider(): WalletClient {
    invariant(this._web3Provider, 'Web3 Provider is not defined');
    return this._web3Provider;
  }

  // Balances

  @Logger('Balances:')
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
    const web3Provider = this.useWeb3Provider();

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
      { domain, primaryType: 'Permit', types: PERMIT_MESSAGE_TYPES, message },
      (_, value) => (isHex(value) ? value.toLowerCase() : value),
    );

    const signature = await web3Provider.request({
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
      nonce,
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
    const web3Provider = this.useWeb3Provider();

    if (web3Provider.account) return web3Provider.account.address;

    const [account] = await web3Provider.requestAddresses();
    invariant(account, 'web3provider must have at least 1 account');
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

  @Logger('Utils:')
  @Cache(30 * 60 * 1000, ['chain.id'])
  public getSubgraphId(): string {
    const id = SUBRGRAPH_ID_BY_CHAIN[this.chainId];
    invariant(id, `Subgraph is not supported for chain ${this.chainId}`);
    return id;
  }

  public async performTransaction(
    props: PerformTransactionOptions,
  ): Promise<TransactionResult> {
    this.useWeb3Provider();
    const { account, callback, getGasLimit, sendTransaction } = props;
    const isContract = await this.isContract(account);

    const overrides: TransactionOptions = {
      account,
      chain: this.chain,
      gas: undefined,
      maxFeePerGas: undefined,
      maxPriorityFeePerGas: undefined,
    };

    if (!isContract) {
      callback({ stage: TransactionCallbackStage.GAS_LIMIT });
      overrides.gas = await getGasLimit(overrides);
      const feeData = await this.getFeeData();
      overrides.maxFeePerGas = feeData.maxFeePerGas;
      overrides.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
    }

    callback({ stage: TransactionCallbackStage.SIGN, payload: overrides.gas });
    const transactionHash = await sendTransaction(overrides);

    if (isContract) {
      callback({ stage: TransactionCallbackStage.MULTISIG_DONE });
      return { hash: transactionHash };
    }

    callback({
      stage: TransactionCallbackStage.RECEIPT,
      payload: transactionHash,
    });

    const transactionReceipt = await this.rpcProvider.waitForTransactionReceipt(
      {
        hash: transactionHash,
      },
    );

    callback({
      stage: TransactionCallbackStage.CONFIRMATION,
      payload: transactionReceipt,
    });

    const confirmations = await this.rpcProvider.getTransactionConfirmations({
      hash: transactionReceipt.transactionHash,
    });

    callback({
      stage: TransactionCallbackStage.DONE,
      payload: confirmations,
    });

    return {
      hash: transactionHash,
      receipt: transactionReceipt,
      confirmations,
    };
  }
}

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
  GetBlockReturnType,
} from 'viem';
import {
  invariant,
  invariantArgument,
  withSdkError,
} from '../common/utils/sdk-error.js';
import { splitSignature } from '@ethersproject/bytes';

import { type SDKErrorProps, SDKError } from '../common/utils/index.js';
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
  APPROX_SECONDS_PER_BLOCK,
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
  GetFeeDataResult,
  BlockArgumentType,
  BackArgumentType,
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
      this.error({
        message: `Unsupported chain: ${chainId}`,
        code: 'INVALID_ARGUMENT',
      });
    }

    if (!rpcProvider && rpcUrls.length === 0) {
      this.error({
        message: `Either rpcProvider or rpcUrls are required`,
        code: 'INVALID_ARGUMENT',
      });
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
    invariantArgument(
      web3Provider.chain === this.chain,
      `Chain in Web3Provider(${web3Provider.chain?.id}) does not match current chain(${this.chain})`,
    );
    this._web3Provider = web3Provider;
  }

  @Logger('Provider:')
  public useWeb3Provider(): WalletClient {
    invariant(
      this._web3Provider,
      'Web3 Provider is not defined',
      'PROVIDER_ERROR',
    );
    return this._web3Provider;
  }

  // Balances

  @Logger('Balances:')
  public async balanceETH(address: Address): Promise<bigint> {
    return this.rpcProvider.getBalance({ address });
  }

  // Contracts

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['chain.id'])
  public contractAddressLidoLocator(): Address {
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
  public async getFeeData(): Promise<GetFeeDataResult> {
    // we look back 5 blocks at fees of botton 25% txs
    // if you want to increase maxPriorityFee output increase percentile
    const feeHistory = await this.rpcProvider.getFeeHistory({
      blockCount: 5,
      blockTag: 'pending',
      rewardPercentiles: [25],
    });

    // get average priority fee
    const maxPriorityFeePerGas =
      feeHistory.reward && feeHistory.reward.length > 0
        ? feeHistory.reward
            .map((fees) => (fees[0] ? BigInt(fees[0]) : 0n))
            .reduce((sum, fee) => sum + fee) / BigInt(feeHistory.reward.length)
        : 0n;

    const lastBaseFeePerGas = feeHistory.baseFeePerGas[0]
      ? BigInt(feeHistory.baseFeePerGas[0])
      : 0n;

    // we have to multiply by 2 until we find a reliable way to predict baseFee change
    const maxFeePerGas = lastBaseFeePerGas * 2n + maxPriorityFeePerGas;

    return {
      lastBaseFeePerGas,
      maxPriorityFeePerGas,
      maxFeePerGas,
      gasPrice: maxFeePerGas, // fallback
    };
  }

  @Logger('Utils:')
  public async getWeb3Address(): Promise<Address> {
    const web3Provider = this.useWeb3Provider();

    if (web3Provider.account) return web3Provider.account.address;

    const [account] = await web3Provider.requestAddresses();
    invariant(
      account,
      'web3provider must have at least 1 account',
      'PROVIDER_ERROR',
    );
    return account;
  }

  @Logger('Utils:')
  @Cache(60 * 60 * 1000, ['chain.id'])
  public async isContract(address: Address): Promise<boolean> {
    // eth_getCode returns hex string of bytecode at address
    // for accounts it's "0x"
    // for contract it's potentially very long hex (can't be safely&quickly parsed)
    const result = await this.rpcProvider.getBytecode({ address: address });
    return result ? result !== '0x' : false;
  }

  @Logger('Utils:')
  public error(props: SDKErrorProps): SDKError {
    return new SDKError(props);
  }

  @Logger('Utils:')
  @Cache(30 * 60 * 1000, ['chain.id'])
  public async getContractAddress(
    contract: LIDO_CONTRACT_NAMES,
  ): Promise<Address> {
    const lidoLocator = this.getContractLidoLocator();
    if (contract === 'wsteth') {
      const withdrawalQueue = await lidoLocator.read.withdrawalQueue();
      const contract = await this.getContractWQ(withdrawalQueue);
      const wstethAddress = await contract.read.WSTETH();

      return wstethAddress;
    } else {
      return lidoLocator.read[contract]();
    }
  }

  @Logger('Utils:')
  @Cache(30 * 60 * 1000, ['chain.id'])
  public getSubgraphId(): string {
    const id = SUBRGRAPH_ID_BY_CHAIN[this.chainId];
    invariant(
      id,
      `Subgraph is not supported for chain ${this.chainId}`,
      'NOT_SUPPORTED',
    );
    return id;
  }

  // TODO: important tests for this
  @Cache(30 * 60, ['chain.id'])
  public async getLatestBlockToTimestamp(
    timestamp: bigint,
  ): Promise<GetBlockReturnType<Chain, false, 'latest'>> {
    const now = BigInt(Math.floor(Date.now() / 1000));
    let latestBlock = await this.rpcProvider.getBlock({ blockTag: 'latest' });
    if (latestBlock.timestamp < timestamp) {
      return latestBlock;
    }
    let mid = latestBlock.number - (now - timestamp) / APPROX_SECONDS_PER_BLOCK;
    invariantArgument(mid > 0n, 'No blocks at this timestamp');

    let block = await this.rpcProvider.getBlock({ blockNumber: mid });
    // feeling lucky?
    if (block.timestamp === timestamp) return block;

    const isOverShoot = block.timestamp < timestamp;
    let left = isOverShoot ? block.number : 0n;
    let right = isOverShoot ? latestBlock.number : block.number;

    while (left <= right) {
      mid = (left + right) / 2n;
      block = await this.rpcProvider.getBlock({ blockNumber: mid });
      if (block.timestamp === timestamp) {
        return block;
      } else if (block.timestamp < timestamp) {
        latestBlock = block;
        left = mid + 1n;
      } else {
        right = mid - 1n;
      }
    }
    return latestBlock;
  }

  @Logger('Utils:')
  public async toBlockNumber(arg: BlockArgumentType): Promise<bigint> {
    if (arg.timestamp) {
      const block = await this.getLatestBlockToTimestamp(arg.timestamp);
      return block.number;
    }
    const { block } = arg;
    if (typeof block === 'bigint') return block;
    const { number } = await this.rpcProvider.getBlock({
      blockTag: block,
    });
    invariantArgument(number, 'block must not be pending');
    return number;
  }

  @Logger('Utils:')
  public async toBackBlock(
    arg: BackArgumentType,
    start: bigint,
  ): Promise<bigint> {
    if (arg.blocks) {
      const end = start - arg.blocks;
      invariantArgument(end >= 0n, 'Too many blocks back');
      return end;
    } else if (arg.days) {
      const date = (BigInt(Date.now()) - arg.days * 86400000n) / 1000n;
      const block = await this.getLatestBlockToTimestamp(date);
      return block.number;
    } else if (arg.seconds) {
      const date = BigInt(Date.now() / 1000) - arg.seconds;
      const block = await this.getLatestBlockToTimestamp(date);
      return block.number;
    }
    invariantArgument(false, 'must have at least something in back argument');
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
      const feeData = await this.getFeeData();
      overrides.maxFeePerGas = feeData.maxFeePerGas;
      overrides.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
      try {
        overrides.gas = await getGasLimit(overrides);
      } catch {
        // we retry without fees to see if tx will go trough
        await withSdkError(
          getGasLimit({
            ...overrides,
            maxFeePerGas: undefined,
            maxPriorityFeePerGas: undefined,
          }),
          'TRANSACTION_ERROR',
        );
        throw new SDKError({
          code: 'TRANSACTION_ERROR',
          message: 'Not enough ether for gas',
        });
      }
    }

    callback({ stage: TransactionCallbackStage.SIGN, payload: overrides.gas });

    const transactionHash = await withSdkError(
      sendTransaction(overrides),
      'TRANSACTION_ERROR',
    );

    if (isContract) {
      callback({ stage: TransactionCallbackStage.MULTISIG_DONE });
      return { hash: transactionHash };
    }

    callback({
      stage: TransactionCallbackStage.RECEIPT,
      payload: transactionHash,
    });

    const transactionReceipt = await withSdkError(
      this.rpcProvider.waitForTransactionReceipt({
        hash: transactionHash,
      }),
      'TRANSACTION_ERROR',
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

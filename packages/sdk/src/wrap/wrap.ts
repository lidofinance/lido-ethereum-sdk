import {
  getContract,
  encodeFunctionData,
  parseEther,
  type Address,
  type GetContractReturnType,
  type PublicClient,
  type WalletClient,
  type FormattedTransactionRequest,
  type WriteContractParameters,
} from 'viem';
import invariant from 'tiny-invariant';
import { LidoSDKCore } from '../core/index.js';
import { Logger, Cache, ErrorHandler } from '../common/decorators/index.js';
import {
  LidoSDKWrapProps,
  CommonWrapProps,
  TxResult,
  PopulatedTx,
  IMethodProps as ITxMethodProps,
} from './types.js';
import { version } from '../version.js';

import { abi } from './abi/wsteth.js';
import { stethPartialAbi } from './abi/steth-partial.js';

import { LIDO_CONTRACT_NAMES } from '../common/constants.js';
import {
  TransactionCallback,
  TransactionCallbackStage,
} from '../core/types.js';

export class LidoSDKWrap {
  readonly core: LidoSDKCore;

  constructor(props: LidoSDKWrapProps) {
    const { core, ...rest } = props;

    if (core) this.core = core;
    else this.core = new LidoSDKCore(rest, version);
  }

  // Contracts

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['core.chain.id'])
  public async contractAddressWstETH(): Promise<Address> {
    invariant(this.core.chain, 'Chain is not defined');

    return await this.core.getContractAddress(LIDO_CONTRACT_NAMES.wsteth);
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['core.chain.id', 'contractAddressWstETH'])
  public async getContractWstETH(): Promise<
    GetContractReturnType<typeof abi, PublicClient, WalletClient>
  > {
    const address = await this.contractAddressWstETH();

    return getContract({
      address,
      abi: abi,
      publicClient: this.core.rpcProvider,
      walletClient: this.core.web3Provider,
    });
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['core.chain.id'])
  private async getPartialContractSteth(): Promise<
    GetContractReturnType<typeof stethPartialAbi, PublicClient, WalletClient>
  > {
    const address = await this.core.getContractAddress(
      LIDO_CONTRACT_NAMES.lido,
    );

    return getContract({
      address,
      abi: stethPartialAbi,
      publicClient: this.core.rpcProvider,
      walletClient: this.core.web3Provider,
    });
  }

  // Balances

  @Logger('Balances:')
  @Cache(10 * 1000, ['core.chain.id'])
  public async balanceWstETH(address: Address): Promise<bigint> {
    const contract = await this.getContractWstETH();
    return contract.read.balanceOf([address]);
  }

  // Calls

  //// WRAP ETH

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async wrapEth(props: CommonWrapProps): Promise<TxResult> {
    return this.executeTxMethod(props, this.wrapEthEOA, this.wrapEthMultisig);
  }

  @Logger('LOG:')
  private async wrapEthEOA(props: CommonWrapProps): Promise<TxResult> {
    invariant(this.core.web3Provider, 'Web3 provider is not defined');
    const { value: stringValue, callback = () => {}, account } = props;
    const value = parseEther(stringValue);

    // Checking the daily protocol staking limit
    // because wrapETH stakes for you
    this.validateStakeLimit(value);

    const contract = await this.getContractWstETH();
    callback({ stage: TransactionCallbackStage.GAS_LIMIT });
    const gasLimit = await this.core.rpcProvider.estimateGas({
      account,
      to: contract.address,
      value,
    });

    const { maxFeePerGas, maxPriorityFeePerGas } = await this.core.getFeeData();

    callback({ stage: TransactionCallbackStage.SIGN });
    const transaction = await this.core.web3Provider.sendTransaction({
      value,
      account,
      to: contract.address,
      gas: gasLimit,
      chain: this.core.chain,
      maxFeePerGas,
      maxPriorityFeePerGas,
    });

    return this.waitTransactionLifecycle(transaction, callback);
  }

  @Logger('LOG:')
  private async wrapEthMultisig(props: CommonWrapProps): Promise<TxResult> {
    invariant(this.core.web3Provider, 'Web3 provider is not defined');

    const { value: stringValue, callback = () => {}, account } = props;
    const value = parseEther(stringValue);
    const contract = await this.getContractWstETH();

    callback({ stage: TransactionCallbackStage.SIGN });
    const hash = await this.core.web3Provider.sendTransaction({
      value,
      chain: this.core.chain,
      account,
      to: contract.address,
    });

    callback({ stage: TransactionCallbackStage.MULTISIG_DONE });

    return { hash };
  }

  @Logger('Utils:')
  public async wrapEthPopulateTx(props: CommonWrapProps): Promise<PopulatedTx> {
    const { value, account } = props;

    const address = await this.contractAddressWstETH();

    return {
      to: address,
      from: account,
      value: parseEther(value),
    };
  }

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async wrapEthEstimateGas(
    props: Omit<CommonWrapProps, 'callback'>,
  ): Promise<bigint> {
    const { value, account } = props;

    const address = await this.contractAddressWstETH();
    return this.core.rpcProvider.estimateGas({
      account,
      to: address,
      value: parseEther(value),
    });
  }

  /// WRAP STETH

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async wrapSteth(props: CommonWrapProps): Promise<TxResult> {
    return this.executeTxMethod(
      props,
      this.wrapStethEOA,
      this.wrapStethMultisig,
    );
  }

  @Logger('LOG:')
  private async wrapStethEOA(props: CommonWrapProps): Promise<TxResult> {
    invariant(this.core.web3Provider, 'Web3 provider is not defined');
    const { value: stringValue, callback = () => {}, account } = props;
    const value = parseEther(stringValue);
    const contract = await this.getContractWstETH();

    callback({ stage: TransactionCallbackStage.GAS_LIMIT });
    const gasLimit = await contract.estimateGas.wrap([value], {
      account,
    });

    const { maxFeePerGas, maxPriorityFeePerGas } = await this.core.getFeeData();

    callback({ stage: TransactionCallbackStage.SIGN });
    const transaction = await contract.write.wrap([value], {
      chain: this.core.chain,
      gas: gasLimit,
      maxFeePerGas,
      maxPriorityFeePerGas,
      account,
    });

    return this.waitTransactionLifecycle(transaction, callback);
  }

  @Logger('LOG:')
  private async wrapStethMultisig(props: CommonWrapProps): Promise<TxResult> {
    invariant(this.core.web3Provider, 'Web3 provider is not defined');

    const { value: stringValue, callback = () => {}, account } = props;
    const value = parseEther(stringValue);
    const contract = await this.getContractWstETH();

    callback({ stage: TransactionCallbackStage.SIGN });
    const transaction = await contract.write.wrap([value], {
      chain: this.core.chain,
      account,
    });

    callback?.({ stage: TransactionCallbackStage.MULTISIG_DONE });

    return { hash: transaction };
  }

  @Logger('Utils:')
  public async wrapStethPopulateTx(
    props: CommonWrapProps,
  ): Promise<PopulatedTx> {
    const { value: stringValue, account } = props;
    const value = parseEther(stringValue);
    const address = await this.contractAddressWstETH();

    return {
      to: address,
      from: account,
      data: encodeFunctionData({
        abi,
        functionName: 'wrap',
        args: [value],
      }),
    };
  }

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async wrapStethSimulateTx(
    props: Omit<CommonWrapProps, 'callback'>,
  ): Promise<WriteContractParameters> {
    const { value, account } = props;

    const address = await this.contractAddressWstETH();
    const { request } = await this.core.rpcProvider.simulateContract({
      address,
      abi,
      account,

      functionName: 'wrap',
      args: [parseEther(value)],
    });

    return request;
  }

  /// APPROVE

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async approveStethForWrap(props: CommonWrapProps): Promise<TxResult> {
    return this.executeTxMethod(
      props,
      this.approveStethForWrapEOA,
      this.approveStethForWrapMultisig,
    );
  }

  @Logger('Utils:')
  @ErrorHandler('Error:')
  public async getStethForWrapAllowance(account: Address): Promise<bigint> {
    const stethContract = await this.getPartialContractSteth();
    const wstethAddress = await this.contractAddressWstETH();
    return stethContract.read.allowance([account, wstethAddress]);
  }

  @Logger('LOG:')
  private async approveStethForWrapEOA(
    props: CommonWrapProps,
  ): Promise<TxResult> {
    const { account, value: stringValue, callback = () => {} } = props;
    const value = parseEther(stringValue);

    const stethContract = await this.getPartialContractSteth();
    const wstethContractAddress = await this.contractAddressWstETH();

    callback({ stage: TransactionCallbackStage.GAS_LIMIT });
    const gasLimit = await stethContract.estimateGas.approve(
      [wstethContractAddress, value],
      {
        account,
      },
    );

    const { maxFeePerGas, maxPriorityFeePerGas } = await this.core.getFeeData();

    callback({ stage: TransactionCallbackStage.SIGN });
    const transaction = await stethContract.write.approve(
      [wstethContractAddress, value],
      {
        chain: this.core.chain,
        gas: gasLimit,
        maxFeePerGas,
        maxPriorityFeePerGas,
        account,
      },
    );

    return this.waitTransactionLifecycle(transaction, callback);
  }

  @Logger('LOG:')
  private async approveStethForWrapMultisig(
    props: CommonWrapProps,
  ): Promise<TxResult> {
    const { account, value: stringValue, callback = () => {} } = props;
    const value = parseEther(stringValue);

    const stethContract = await this.getPartialContractSteth();
    const wstethContractAddress = await this.contractAddressWstETH();

    callback({ stage: TransactionCallbackStage.SIGN });

    const transaction = await stethContract.write.approve(
      [wstethContractAddress, value],
      {
        chain: this.core.chain,
        account,
      },
    );

    callback({ stage: TransactionCallbackStage.MULTISIG_DONE });

    return { hash: transaction };
  }

  @Logger('Utils:')
  public async approveStethForWrapPopulateTx(
    props: CommonWrapProps,
  ): Promise<Omit<FormattedTransactionRequest, 'type'>> {
    const { value: stringValue, account } = props;
    const value = parseEther(stringValue);

    const stethContract = await this.getPartialContractSteth();
    const wstethContractAddress = await this.contractAddressWstETH();

    return {
      to: stethContract.address,
      from: account,
      data: encodeFunctionData({
        abi: stethPartialAbi,
        functionName: 'approve',
        args: [wstethContractAddress, value],
      }),
    };
  }

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async approveStethForWrapSimulateTx(
    props: Omit<CommonWrapProps, 'callback'>,
  ): Promise<WriteContractParameters> {
    const { value: stringValue, account } = props;
    const value = parseEther(stringValue);

    const stethContract = await this.getPartialContractSteth();
    const wstethContractAddress = await this.contractAddressWstETH();

    const { request } = await this.core.rpcProvider.simulateContract({
      address: stethContract.address,
      abi: stethPartialAbi,
      account,
      functionName: 'approve',
      args: [wstethContractAddress, value],
    });

    return request;
  }

  /// UNWRAP

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async unwrap(props: CommonWrapProps): Promise<TxResult> {
    return this.executeTxMethod(props, this.unwrapEOA, this.unwrapMultisig);
  }

  @Logger('LOG:')
  private async unwrapEOA(props: CommonWrapProps): Promise<TxResult> {
    invariant(this.core.web3Provider, 'Web3 provider is not defined');
    const { value: stringValue, callback = () => {}, account } = props;
    const value = parseEther(stringValue);

    const contract = await this.getContractWstETH();

    callback({ stage: TransactionCallbackStage.GAS_LIMIT });
    const gasLimit = await contract.estimateGas.unwrap([value], {
      account,
    });

    const { maxFeePerGas, maxPriorityFeePerGas } = await this.core.getFeeData();

    callback({ stage: TransactionCallbackStage.SIGN });
    const transaction = await contract.write.unwrap([value], {
      chain: this.core.chain,
      gas: gasLimit,
      maxFeePerGas,
      maxPriorityFeePerGas,
      account,
    });

    return this.waitTransactionLifecycle(transaction, callback);
  }

  @Logger('LOG:')
  private async unwrapMultisig(props: CommonWrapProps): Promise<TxResult> {
    invariant(this.core.web3Provider, 'Web3 provider is not defined');
    const { value: stringValue, callback = () => {}, account } = props;
    const value = parseEther(stringValue);

    const contract = await this.getContractWstETH();

    callback({ stage: TransactionCallbackStage.SIGN });

    const transaction = await contract.write.unwrap([value], {
      chain: this.core.chain,
      account,
    });

    callback({ stage: TransactionCallbackStage.MULTISIG_DONE });

    return { hash: transaction };
  }

  @Logger('Utils:')
  public async unwrapPopulateTx(props: CommonWrapProps): Promise<PopulatedTx> {
    const { value: stringValue, account } = props;
    const value = parseEther(stringValue);
    const to = await this.contractAddressWstETH();

    return {
      to,
      from: account,
      data: encodeFunctionData({
        abi: abi,
        functionName: 'unwrap',
        args: [value],
      }),
    };
  }

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async unwrapSimulateTx(
    props: Omit<CommonWrapProps, 'callback'>,
  ): Promise<WriteContractParameters> {
    const { value: stringValue, account } = props;
    const value = parseEther(stringValue);

    const wstethContractAddress = await this.contractAddressWstETH();

    const { request } = await this.core.rpcProvider.simulateContract({
      address: wstethContractAddress,
      abi,
      account,
      functionName: 'unwrap',
      args: [value],
    });

    return request;
  }

  /// UTILS

  @Logger('Utils:')
  private async validateStakeLimit(value: bigint): Promise<void> {
    const stakeContract = await this.getPartialContractSteth();
    const currentStakeLimit = (
      await stakeContract.read.getStakeLimitFullInfo()
    )[3];

    if (value > currentStakeLimit) {
      throw this.core.error({
        message: `Stake value is greater than daily protocol staking limit (${currentStakeLimit})`,
      });
    }
  }

  private async executeTxMethod<TProps extends ITxMethodProps, TResult>(
    props: TProps,
    EOAMethod: (props: TProps) => Promise<TResult>,
    multisigMethod: (props: TProps) => Promise<TResult>,
  ) {
    invariant(this.core.rpcProvider, 'RPC provider is not defined');
    invariant(this.core.web3Provider, 'Web3 provider is not defined');
    const isContract = await this.core.isContract(props.account);

    if (isContract) return await multisigMethod.call(this, props);
    else return await EOAMethod.call(this, props);
  }

  @Logger('Utils:')
  private async waitTransactionLifecycle(
    transaction: `0x${string}`,
    callback: TransactionCallback,
  ) {
    callback({ stage: TransactionCallbackStage.RECEIPT, payload: transaction });

    const transactionReceipt =
      await this.core.rpcProvider.waitForTransactionReceipt({
        hash: transaction,
      });

    callback({
      stage: TransactionCallbackStage.CONFIRMATION,
      payload: transactionReceipt,
    });

    const confirmations =
      await this.core.rpcProvider.getTransactionConfirmations({
        hash: transactionReceipt.transactionHash,
      });

    callback({ stage: TransactionCallbackStage.DONE, payload: confirmations });

    return { hash: transaction, receipt: transactionReceipt, confirmations };
  }

  /// VIEWS

  @Logger('Views:')
  @ErrorHandler('Error:')
  public async convertStethToWsteth(steth_value: string): Promise<bigint> {
    const value = parseEther(steth_value);
    const contract = await this.getContractWstETH();
    return contract.read.getWstETHByStETH([value]);
  }

  @Logger('Views:')
  @ErrorHandler('Error:')
  public async convertWstethToSteth(wsteth_value: string): Promise<bigint> {
    const value = parseEther(wsteth_value);
    const contract = await this.getContractWstETH();
    return contract.read.getStETHByWstETH([value]);
  }
}

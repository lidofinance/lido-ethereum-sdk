import {
  getContract,
  type Address,
  type GetContractReturnType,
  type PublicClient,
  type WalletClient,
  encodeFunctionData,
  parseEther,
  FormattedTransactionRequest,
} from 'viem';
import invariant from 'tiny-invariant';
import { LidoSDKCore } from '../core/index.js';
import { Logger, Cache } from '../common/decorators/index.js';
import {
  LidoSDKWrapProps,
  CommonWrapProps,
  TxResult,
  PopulatedTx,
  IMethodProps,
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
  private async getStethPartialContract(): Promise<
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
  public async balanceStETH(address: Address): Promise<bigint> {
    const contract = await this.getContractWstETH();
    return contract.read.balanceOf([address]);
  }

  // Calls

  //// WRAP ETH

  @Logger('Call:')
  public async wrapEth(props: CommonWrapProps): Promise<TxResult> {
    return this.methodWrapper(props, this.wrapEthEOA, this.wrapEthMultisig);
  }

  @Logger('LOG:')
  private async wrapEthEOA(props: CommonWrapProps): Promise<TxResult> {
    const { value: stringValue, callback = () => {}, account } = props;
    const value = parseEther(stringValue);

    // Checking the daily protocol staking limit
    // because wrapETH stakes for you
    this.validateStakeLimit(value);

    invariant(this.core.web3Provider, 'Web3 provider is not defined');

    const contract = await this.getContractWstETH();

    const gasLimit = await this.core.rpcProvider.estimateGas({
      account,
      to: contract.address,
      value,
    });

    callback({ stage: TransactionCallbackStage.SIGN });

    const { maxFeePerGas, maxPriorityFeePerGas } = await this.core.getFeeData();

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
    const { value: stringValue, callback = () => {}, account } = props;
    const value = parseEther(stringValue);

    invariant(this.core.web3Provider, 'Web3 provider is not defined');

    callback({ stage: TransactionCallbackStage.SIGN });

    const contract = await this.getContractWstETH();
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

  /// WRAP STETH

  @Logger('Call:')
  public async wrapSteth(props: CommonWrapProps): Promise<TxResult> {
    return this.methodWrapper(props, this.wrapStethEOA, this.wrapStethMultisig);
  }

  @Logger('LOG:')
  private async wrapStethEOA(props: CommonWrapProps): Promise<TxResult> {
    invariant(this.core.web3Provider, 'Web3 provider is not defined');
    const { value: stringValue, callback = () => {}, account } = props;
    const value = parseEther(stringValue);

    const contract = await this.getContractWstETH();

    const gasLimit = await contract.estimateGas.wrap([value], {
      account,
    });

    callback({ stage: TransactionCallbackStage.SIGN });

    const { maxFeePerGas, maxPriorityFeePerGas } = await this.core.getFeeData();

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
    const { value: stringValue, callback = () => {}, account } = props;
    const value = parseEther(stringValue);

    invariant(this.core.web3Provider, 'Web3 provider is not defined');

    callback({ stage: TransactionCallbackStage.SIGN });

    const contract = await this.getContractWstETH();
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

  /// APPROVE

  public async approveStethForWrap(props: CommonWrapProps): Promise<TxResult> {
    return this.methodWrapper(
      props,
      this.approveStethForWrapEOA,
      this.approveStethForWrapMultisig,
    );
  }

  public async getStethForWrapAllowance(
    props: CommonWrapProps,
  ): Promise<bigint> {
    const stethContract = await this.getStethPartialContract();
    const wstethAddress = await this.contractAddressWstETH();
    return stethContract.read.allowance([props.account, wstethAddress]);
  }

  private async approveStethForWrapEOA(
    props: CommonWrapProps,
  ): Promise<TxResult> {
    const { account, value: stringValue, callback = () => {} } = props;
    const value = parseEther(stringValue);

    const stethContract = await this.getStethPartialContract();
    const wstethContractAddress = await this.contractAddressWstETH();

    const gasLimit = await stethContract.estimateGas.approve(
      [wstethContractAddress, value],
      {
        account,
      },
    );

    callback({ stage: TransactionCallbackStage.SIGN });

    const { maxFeePerGas, maxPriorityFeePerGas } = await this.core.getFeeData();

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

  private async approveStethForWrapMultisig(
    props: CommonWrapProps,
  ): Promise<TxResult> {
    const { account, value: stringValue, callback = () => {} } = props;
    const value = parseEther(stringValue);

    const stethContract = await this.getStethPartialContract();
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

  public async approveStethForWrapPopulateTx(
    props: CommonWrapProps,
  ): Promise<Omit<FormattedTransactionRequest, 'type'>> {
    const { value: stringValue, account } = props;
    const value = parseEther(stringValue);

    const stethContract = await this.getStethPartialContract();
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

  /// UNWRAP

  public async unwrap(props: CommonWrapProps): Promise<TxResult> {
    return this.methodWrapper(props, this.unwrapEOA, this.unwrapMultisig);
  }

  private async unwrapEOA(props: CommonWrapProps): Promise<TxResult> {
    invariant(this.core.web3Provider, 'Web3 provider is not defined');
    const { value: stringValue, callback = () => {}, account } = props;
    const value = parseEther(stringValue);

    const contract = await this.getContractWstETH();

    const gasLimit = await contract.estimateGas.unwrap([value], {
      account,
    });

    callback({ stage: TransactionCallbackStage.SIGN });

    const { maxFeePerGas, maxPriorityFeePerGas } = await this.core.getFeeData();

    const transaction = await contract.write.unwrap([value], {
      chain: this.core.chain,
      gas: gasLimit,
      maxFeePerGas,
      maxPriorityFeePerGas,
      account,
    });

    return this.waitTransactionLifecycle(transaction, callback);
  }

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

  /// UTILS

  @Logger('Utils:')
  private async validateStakeLimit(value: bigint): Promise<void> {
    const stakeContract = await this.getStethPartialContract();
    const currentStakeLimit = (
      await stakeContract.read.getStakeLimitFullInfo()
    )[3];

    if (value > currentStakeLimit) {
      throw this.core.error({
        message: `Stake value is greater than daily protocol staking limit (${currentStakeLimit})`,
      });
    }
  }

  private async methodWrapper<TProps extends IMethodProps, TResult>(
    props: TProps,
    EOAMethod: (props: TProps) => Promise<TResult>,
    multisigMethod: (props: TProps) => Promise<TResult>,
  ) {
    invariant(this.core.rpcProvider, 'RPC provider is not defined');
    invariant(this.core.web3Provider, 'Web3 provider is not defined');
    try {
      const isContract = await this.core.isContract(props.account);

      if (isContract) return await multisigMethod.call(this, props);
      else return await EOAMethod.call(this, props);
    } catch (error) {
      const { message, code } = this.core.getErrorMessage(error);
      const txError = this.core.error({
        message,
        error,
        code,
      });
      props.callback?.({
        stage: TransactionCallbackStage.ERROR,
        payload: txError,
      });

      throw txError;
    }
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
}

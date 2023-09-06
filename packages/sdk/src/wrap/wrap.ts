import {
  getContract,
  type Address,
  type GetContractReturnType,
  type PublicClient,
  type WalletClient,
  parseEther,
} from 'viem';
import invariant from 'tiny-invariant';
import { LidoSDKCore } from '../core/index.js';
import { Logger, Cache } from '../common/decorators/index.js';
import {
  LidoSDKWrapProps,
  WrapCallbackStage,
  WrapEthProps,
  WrapResult,
  WrapStageCallback,
} from './types.js';
import { version } from '../version.js';

import { abi } from './abi/wsteth.js';
import { stakeLimitAbi } from './abi/stakeLimit.js';

import { LIDO_CONTRACT_NAMES } from '../common/constants.js';

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
  private async getStakingLimitContract(): Promise<
    GetContractReturnType<typeof stakeLimitAbi, PublicClient, WalletClient>
  > {
    const address = await this.core.getContractAddress(
      LIDO_CONTRACT_NAMES.lido,
    );

    return getContract({
      address,
      abi: stakeLimitAbi,
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
  public async wrapEth(props: WrapEthProps): Promise<WrapResult> {
    return this.methodWrapper(props, this.wrapEthEOA, this.wrapEthMultisig);
  }

  @Logger('LOG:')
  private async wrapEthEOA(props: WrapEthProps): Promise<WrapResult> {
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

    callback({ stage: WrapCallbackStage.SIGN });

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
  private async wrapEthMultisig(props: WrapEthProps): Promise<WrapResult> {
    const { value: stringValue, callback = () => {}, account } = props;
    const value = parseEther(stringValue);

    invariant(this.core.web3Provider, 'Web3 provider is not defined');

    callback({ stage: WrapCallbackStage.SIGN });

    const contract = await this.getContractWstETH();
    const hash = await this.core.web3Provider.sendTransaction({
      value,
      chain: this.core.chain,
      account,
      to: contract.address,
    });

    callback({ stage: WrapCallbackStage.MULTISIG_DONE });

    return { hash };
  }

  /// WRAP STETH

  @Logger('Call:')
  public async wrapSteth(props: WrapEthProps): Promise<WrapResult> {
    return this.methodWrapper(props, this.wrapStethEOA, this.wrapStethMultisig);
  }

  private async wrapStethEOA(props: WrapEthProps): Promise<WrapResult> {
    invariant(this.core.web3Provider, 'Web3 provider is not defined');
    console.log(this);
    const { value: stringValue, callback = () => {}, account } = props;
    const value = parseEther(stringValue);

    const contract = await this.getContractWstETH();

    const gasLimit = await this.core.rpcProvider.estimateGas({
      account,
      to: contract.address,
      value,
    });

    callback({ stage: WrapCallbackStage.SIGN });

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

  private async wrapStethMultisig(props: WrapEthProps): Promise<WrapResult> {
    const { value: stringValue, callback = () => {}, account } = props;
    const value = parseEther(stringValue);

    invariant(this.core.web3Provider, 'Web3 provider is not defined');

    callback({ stage: WrapCallbackStage.SIGN });

    const contract = await this.getContractWstETH();
    const transaction = await contract.write.wrap([value], {
      chain: this.core.chain,
      account,
    });

    callback?.({ stage: WrapCallbackStage.MULTISIG_DONE });

    return { hash: transaction };
  }

  @Logger('Utils:')
  private async validateStakeLimit(value: bigint): Promise<void> {
    const stakeContract = await this.getStakingLimitContract();
    const currentStakeLimit = (
      await stakeContract.read.getStakeLimitFullInfo()
    )[3];

    if (value > currentStakeLimit) {
      throw this.core.error({
        message: `Stake value is greater than daily protocol staking limit (${currentStakeLimit})`,
      });
    }
  }

  private async methodWrapper<TProps extends WrapEthProps, TResult>(
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
      props.callback?.({ stage: WrapCallbackStage.ERROR, payload: txError });

      throw txError;
    }
  }

  private async waitTransactionLifecycle(
    transaction: `0x${string}`,
    callback: WrapStageCallback,
  ) {
    callback({ stage: WrapCallbackStage.RECEIPT, payload: transaction });

    const transactionReceipt =
      await this.core.rpcProvider.waitForTransactionReceipt({
        hash: transaction,
      });

    callback({
      stage: WrapCallbackStage.CONFIRMATION,
      payload: transactionReceipt,
    });

    const confirmations =
      await this.core.rpcProvider.getTransactionConfirmations({
        hash: transactionReceipt.transactionHash,
      });

    callback({ stage: WrapCallbackStage.DONE, payload: confirmations });

    return { hash: transaction, receipt: transactionReceipt, confirmations };
  }
}

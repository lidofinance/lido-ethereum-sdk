import {
  zeroAddress,
  parseEther,
  getContract,
  encodeFunctionData,
  type Address,
  type Account,
  type GetContractReturnType,
  type PublicClient,
  type WalletClient,
  type Hash,
  type WriteContractParameters,
  type FormattedTransactionRequest,
} from 'viem';
import invariant from 'tiny-invariant';
import { LidoSDKCore } from '../core/index.js';
import { Logger, Cache } from '../common/decorators/index.js';

import { SUBMIT_EXTRA_GAS_TRANSACTION_RATIO } from '../common/constants.js';
import { version } from '../version.js';

import { abi } from './abi/steth.js';
import {
  LidoSDKStakingProps,
  StakeCallbackStage,
  StakeProps,
  StakeResult,
  StakeEncodeDataProps,
} from './types.js';

export class LidoSDKStaking {
  readonly core: LidoSDKCore;

  constructor(props: LidoSDKStakingProps) {
    const { core, ...rest } = props;

    if (core) this.core = core;
    else this.core = new LidoSDKCore(rest, version);
  }

  // Balances

  @Logger('Balances:')
  @Cache(10 * 1000, ['core.chain.id'])
  public async balanceStETH(address: Address): Promise<bigint> {
    const contract = await this.getContractStETH();

    return contract.read.balanceOf([address]);
  }

  // Contracts

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['core.chain.id'])
  public async contractAddressStETH(): Promise<Address> {
    invariant(this.core.chain, 'Chain is not defined');

    return await this.core.getContractAddress('lido');
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['core.chain.id', 'contractAddressStETH'])
  public async getContractStETH(): Promise<
    GetContractReturnType<typeof abi, PublicClient, WalletClient>
  > {
    const address = await this.contractAddressStETH();

    return getContract({
      address,
      abi: abi,
      publicClient: this.core.rpcProvider,
      walletClient: this.core.web3Provider,
    });
  }

  // Calls

  @Logger('Call:')
  public async stake(props: StakeProps): Promise<StakeResult> {
    invariant(this.core.web3Provider, 'Web3 provider is not defined');

    const { callback, account } = props;
    try {
      const isContract = await this.core.isContract(account);

      if (isContract) return await this.stakeMultisig(props);
      else return await this.stakeEOA(props);
    } catch (error) {
      const { message, code } = this.core.getErrorMessage(error);
      const txError = this.core.error({
        message,
        error,
        code,
      });
      callback?.({ stage: StakeCallbackStage.ERROR, payload: txError });

      throw txError;
    }
  }

  @Logger('LOG:')
  private async stakeEOA(props: StakeProps): Promise<StakeResult> {
    const { value, callback, referralAddress = zeroAddress, account } = props;

    invariant(this.core.rpcProvider, 'RPC provider is not defined');
    invariant(this.core.web3Provider, 'Web3 provider is not defined');
    // Checking the daily protocol staking limit
    await this.validateStakeLimit(value);

    const { gasLimit, overrides } = await this.submitGasLimit(
      account,
      value,
      referralAddress,
    );

    callback?.({ stage: StakeCallbackStage.SIGN });

    const contract = await this.getContractStETH();
    const transaction = await contract.write.submit([referralAddress], {
      ...overrides,
      value: parseEther(value),
      chain: this.core.chain,
      gas: gasLimit,
      account,
    });

    callback?.({ stage: StakeCallbackStage.RECEIPT, payload: transaction });

    const transactionReceipt =
      await this.core.rpcProvider.waitForTransactionReceipt({
        hash: transaction,
      });

    callback?.({
      stage: StakeCallbackStage.CONFIRMATION,
      payload: transactionReceipt,
    });

    const confirmations =
      await this.core.rpcProvider.getTransactionConfirmations({
        hash: transactionReceipt.transactionHash,
      });

    callback?.({ stage: StakeCallbackStage.DONE, payload: confirmations });

    return { hash: transaction, receipt: transactionReceipt, confirmations };
  }

  @Logger('LOG:')
  private async stakeMultisig(props: StakeProps): Promise<StakeResult> {
    const { value, callback, referralAddress = zeroAddress, account } = props;

    callback?.({ stage: StakeCallbackStage.SIGN });

    const contract = await this.getContractStETH();
    const transaction = await contract.write.submit([referralAddress], {
      value: parseEther(value),
      chain: this.core.chain,
      account,
    });

    callback?.({ stage: StakeCallbackStage.MULTISIG_DONE });

    return { hash: transaction };
  }

  @Logger('Call:')
  public async stakeSimulateTx(
    props: StakeProps,
  ): Promise<WriteContractParameters> {
    const { referralAddress = zeroAddress, value, account } = props;

    const address = await this.contractAddressStETH();
    const { request } = await this.core.rpcProvider.simulateContract({
      address,
      abi,
      functionName: 'submit',
      account,
      args: [referralAddress],
      value: parseEther(value),
    });

    return request;
  }

  // Views

  @Logger('Views:')
  @Cache(30 * 1000, ['core.chain.id'])
  public async getStakeLimitInfo() {
    const contract = await this.getContractStETH();

    return contract.read.getStakeLimitFullInfo();
  }

  // Utils

  @Logger('Utils:')
  @Cache(30 * 1000, ['core.chain.id'])
  private async submitGasLimit(
    account: Address,
    value: string,
    referralAddress: Address = zeroAddress,
  ): Promise<{
    gasLimit: bigint | undefined;
    overrides: {
      account: Account | Address;
      value: bigint;
      maxPriorityFeePerGas: bigint | undefined;
      maxFeePerGas: bigint | undefined;
    };
  }> {
    invariant(this.core.web3Provider, 'Web3 provider is not defined');

    const feeData = await this.core.getFeeData();

    const overrides = {
      account,
      value: parseEther(value),
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ?? undefined,
      maxFeePerGas: feeData.maxFeePerGas ?? undefined,
    };

    const contract = await this.getContractStETH();
    const originalGasLimit = await contract.estimateGas.submit(
      [referralAddress],
      overrides,
    );
    const gasLimit = originalGasLimit
      ? BigInt(
          Math.ceil(
            Number(originalGasLimit) * SUBMIT_EXTRA_GAS_TRANSACTION_RATIO,
          ),
        )
      : undefined;

    return { gasLimit, overrides };
  }

  @Logger('Utils:')
  private async validateStakeLimit(value: string): Promise<void> {
    const currentStakeLimit = (await this.getStakeLimitInfo())[3];
    const parsedValue = parseEther(value);

    if (parsedValue > currentStakeLimit) {
      throw this.core.error({
        message: `Stake value is greater than daily protocol staking limit (${currentStakeLimit})`,
      });
    }
  }

  @Logger('Utils:')
  private stakeEncodeData(props: StakeEncodeDataProps): Hash {
    const { referralAddress = zeroAddress } = props;

    return encodeFunctionData({
      abi,
      functionName: 'submit',
      args: [referralAddress],
    });
  }

  @Logger('Utils:')
  public async stakePopulateTx(
    props: StakeProps,
  ): Promise<Omit<FormattedTransactionRequest, 'type'>> {
    const { referralAddress = zeroAddress, value, account } = props;

    const data = this.stakeEncodeData({ referralAddress });
    const address = await this.contractAddressStETH();

    return {
      to: address,
      from: account,
      value: parseEther(value),
      data,
    };
  }
}

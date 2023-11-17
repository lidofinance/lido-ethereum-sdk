import { zeroAddress, getContract, encodeFunctionData } from 'viem';
import type {
  Address,
  GetContractReturnType,
  PublicClient,
  WalletClient,
  Hash,
  WriteContractParameters,
} from 'viem';

import {
  type TransactionResult,
  type PopulatedTransaction,
  TransactionOptions,
} from '../core/index.js';
import { ERROR_CODE } from '../common/utils/sdk-error.js';
import { Logger, Cache, ErrorHandler } from '../common/decorators/index.js';
import {
  SUBMIT_EXTRA_GAS_TRANSACTION_RATIO,
  LIDO_CONTRACT_NAMES,
  NOOP,
  GAS_TRANSACTION_RATIO_PRECISION,
} from '../common/constants.js';
import { parseValue } from '../common/utils/parse-value.js';

import { StethAbi } from './abi/steth.js';
import type {
  StakeProps,
  StakeEncodeDataProps,
  StakeInnerProps,
  StakeLimitResult,
} from './types.js';
import { LidoSDKModule } from '../common/class-primitives/sdk-module.js';

export class LidoSDKStake extends LidoSDKModule {
  // Contracts

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['core.chain.id'])
  public async contractAddressStETH(): Promise<Address> {
    return await this.core.getContractAddress(LIDO_CONTRACT_NAMES.lido);
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['core.chain.id', 'contractAddressStETH'])
  public async getContractStETH(): Promise<
    GetContractReturnType<typeof StethAbi, PublicClient, WalletClient>
  > {
    const address = await this.contractAddressStETH();

    return getContract({
      address,
      abi: StethAbi,
      publicClient: this.core.rpcProvider,
      walletClient: this.core.web3Provider,
    });
  }

  // Calls

  @Logger('Call:')
  @ErrorHandler()
  public async stakeEth(props: StakeProps): Promise<TransactionResult> {
    this.core.useWeb3Provider();
    const { callback, account, referralAddress, value } =
      this.parseProps(props);

    await this.validateStakeLimit(value);

    const contract = await this.getContractStETH();
    return this.core.performTransaction({
      callback,
      account,
      getGasLimit: async (options) =>
        this.submitGasLimit(value, referralAddress, options),
      sendTransaction: (options) =>
        contract.write.submit([referralAddress], { ...options, value }),
    });
  }

  @Logger('Call:')
  @ErrorHandler()
  public async stakeEthSimulateTx(
    props: StakeProps,
  ): Promise<WriteContractParameters> {
    const { referralAddress, value, account } = this.parseProps(props);
    const accountAddress = await this.core.getWeb3Address(account);
    const address = await this.contractAddressStETH();
    const { request } = await this.core.rpcProvider.simulateContract({
      address,
      abi: StethAbi,
      functionName: 'submit',
      account: accountAddress,
      args: [referralAddress],
      value: value,
    });

    return request;
  }

  // Views

  @Logger('Views:')
  @ErrorHandler()
  public async getStakeLimitInfo(): Promise<StakeLimitResult> {
    const contract = await this.getContractStETH();
    const [
      isStakingPaused,
      isStakingLimitSet,
      currentStakeLimit,
      maxStakeLimit,
      maxStakeLimitGrowthBlocks,
      prevStakeLimit,
      prevStakeBlockNumber,
    ] = await contract.read.getStakeLimitFullInfo();
    return {
      isStakingPaused,
      isStakingLimitSet,
      currentStakeLimit,
      maxStakeLimit,
      maxStakeLimitGrowthBlocks,
      prevStakeLimit,
      prevStakeBlockNumber,
    };
  }

  // Utils

  @Logger('Utils:')
  @Cache(30 * 1000, ['core.chain.id'])
  private async submitGasLimit(
    value: bigint,
    referralAddress: Address,
    options: TransactionOptions,
  ): Promise<bigint> {
    const contract = await this.getContractStETH();
    const originalGasLimit = await contract.estimateGas.submit(
      [referralAddress],
      { ...options, value },
    );

    const gasLimit =
      (originalGasLimit *
        BigInt(
          GAS_TRANSACTION_RATIO_PRECISION * SUBMIT_EXTRA_GAS_TRANSACTION_RATIO,
        )) /
      BigInt(GAS_TRANSACTION_RATIO_PRECISION);

    return gasLimit;
  }

  @Logger('Utils:')
  private async validateStakeLimit(value: bigint): Promise<void> {
    const { currentStakeLimit } = await this.getStakeLimitInfo();

    if (value > currentStakeLimit) {
      throw this.core.error({
        code: ERROR_CODE.TRANSACTION_ERROR,
        message: `Stake value is greater than daily protocol staking limit (${currentStakeLimit})`,
      });
    }
  }

  @Logger('Utils:')
  private stakeEthEncodeData(props: StakeEncodeDataProps): Hash {
    const { referralAddress = zeroAddress } = props;

    return encodeFunctionData({
      abi: StethAbi,
      functionName: 'submit',
      args: [referralAddress],
    });
  }

  @Logger('Utils:')
  public async stakeEthPopulateTx(
    props: StakeProps,
  ): Promise<PopulatedTransaction> {
    const { referralAddress, value, account } = this.parseProps(props);
    const accountAddress = await this.core.getWeb3Address(account);
    const data = this.stakeEthEncodeData({ referralAddress });
    const address = await this.contractAddressStETH();

    return {
      to: address,
      from: accountAddress,
      value,
      data,
    };
  }

  private parseProps(props: StakeProps): StakeInnerProps {
    return {
      ...props,
      referralAddress: props.referralAddress ?? zeroAddress,
      value: parseValue(props.value),
      callback: props.callback ?? NOOP,
    };
  }
}

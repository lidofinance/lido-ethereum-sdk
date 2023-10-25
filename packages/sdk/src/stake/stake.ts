import { zeroAddress, getContract, encodeFunctionData } from 'viem';
import {
  type Address,
  type Account,
  type GetContractReturnType,
  type PublicClient,
  type WalletClient,
  type Hash,
  type WriteContractParameters,
} from 'viem';
import { LidoSDKCore, TransactionResult } from '../core/index.js';
import { Logger, Cache, ErrorHandler } from '../common/decorators/index.js';

import {
  SUBMIT_EXTRA_GAS_TRANSACTION_RATIO,
  LIDO_CONTRACT_NAMES,
  NOOP,
} from '../common/constants.js';
import { parseValue } from '../common/utils/parse-value.js';
import { version } from '../version.js';

import { StethAbi } from './abi/steth.js';
import {
  type LidoSDKStakeProps,
  type StakeProps,
  type StakeEncodeDataProps,
  type StakeInnerProps,
} from './types.js';
import { PopulatedTransaction } from '../core/types.js';

export class LidoSDKStake {
  readonly core: LidoSDKCore;

  constructor(props: LidoSDKStakeProps) {
    const { core } = props;

    if (core) this.core = core;
    else this.core = new LidoSDKCore(props, version);
  }

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
  @ErrorHandler('Error:')
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
        (await this.submitGasLimit(options.account, value, referralAddress))
          .gasLimit,
      sendTransaction: (options) =>
        contract.write.submit([referralAddress], { ...options, value }),
    });
  }

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async stakeEthSimulateTx(
    props: StakeProps,
  ): Promise<WriteContractParameters> {
    const { referralAddress, value, account } = this.parseProps(props);

    const address = await this.contractAddressStETH();
    const { request } = await this.core.rpcProvider.simulateContract({
      address,
      abi: StethAbi,
      functionName: 'submit',
      account,
      args: [referralAddress],
      value: value,
    });

    return request;
  }

  // Views

  @Logger('Views:')
  @ErrorHandler('Error:')
  public async getStakeLimitInfo() {
    const contract = await this.getContractStETH();

    return contract.read.getStakeLimitFullInfo();
  }

  // Utils

  @Logger('Utils:')
  @Cache(30 * 1000, ['core.chain.id'])
  private async submitGasLimit(
    account: Address,
    value: bigint,
    referralAddress: Address,
  ): Promise<{
    gasLimit: bigint;
    overrides: {
      account: Account | Address;
      value: bigint;
      maxPriorityFeePerGas: bigint | undefined;
      maxFeePerGas: bigint | undefined;
    };
  }> {
    const { maxPriorityFeePerGas, maxFeePerGas } = await this.core.getFeeData();

    const overrides = {
      account,
      value,
      maxPriorityFeePerGas,
      maxFeePerGas,
    };

    const contract = await this.getContractStETH();
    const originalGasLimit = await contract.estimateGas.submit(
      [referralAddress],
      overrides,
    );
    const PRECISION = 10 ** 7;
    const gasLimit =
      (originalGasLimit *
        BigInt(PRECISION * SUBMIT_EXTRA_GAS_TRANSACTION_RATIO)) /
      BigInt(PRECISION);

    return { gasLimit, overrides };
  }

  @Logger('Utils:')
  private async validateStakeLimit(value: bigint): Promise<void> {
    const currentStakeLimit = (await this.getStakeLimitInfo())[3];

    if (value > currentStakeLimit) {
      throw this.core.error({
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
    const data = this.stakeEthEncodeData({ referralAddress });
    const address = await this.contractAddressStETH();

    return {
      to: address,
      from: account,
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

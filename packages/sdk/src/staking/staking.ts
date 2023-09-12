import { zeroAddress, getContract, encodeFunctionData } from 'viem';
import {
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
import { Logger, Cache, ErrorHandler } from '../common/decorators/index.js';

import {
  SUBMIT_EXTRA_GAS_TRANSACTION_RATIO,
  LIDO_CONTRACT_NAMES,
  NOOP,
} from '../common/constants.js';
import { version } from '../version.js';

import { StethAbi } from './abi/steth.js';
import {
  type LidoSDKStakingProps,
  type StakeProps,
  type StakeResult,
  type StakeEncodeDataProps,
  StakeInnerProps,
} from './types.js';
import { TransactionCallbackStage } from '../core/types.js';
import { parseValue } from '../common/utils/parse-value.js';

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
  public async stake(props: StakeProps): Promise<StakeResult> {
    invariant(this.core.web3Provider, 'Web3 provider is not defined');
    const parsedProps = this.parseProps(props);
    const { account } = props;

    const isContract = await this.core.isContract(account);

    if (isContract) return await this.stakeMultisig(parsedProps);
    else return await this.stakeEOA(parsedProps);
  }

  @Logger('LOG:')
  private async stakeEOA(props: StakeInnerProps): Promise<StakeResult> {
    const { value, callback, referralAddress, account } = props;

    invariant(this.core.rpcProvider, 'RPC provider is not defined');
    invariant(this.core.web3Provider, 'Web3 provider is not defined');
    // Checking the daily protocol staking limit
    await this.validateStakeLimit(value);

    callback?.({ stage: TransactionCallbackStage.GAS_LIMIT });
    const { gasLimit, overrides } = await this.submitGasLimit(
      account,
      value,
      referralAddress,
    );

    callback?.({ stage: TransactionCallbackStage.SIGN, payload: gasLimit });

    const contract = await this.getContractStETH();
    const transaction = await contract.write.submit([referralAddress], {
      ...overrides,
      value,
      chain: this.core.chain,
      gas: gasLimit,
      account,
    });

    callback?.({
      stage: TransactionCallbackStage.RECEIPT,
      payload: transaction,
    });

    const transactionReceipt =
      await this.core.rpcProvider.waitForTransactionReceipt({
        hash: transaction,
      });

    callback?.({
      stage: TransactionCallbackStage.CONFIRMATION,
      payload: transactionReceipt,
    });

    const confirmations =
      await this.core.rpcProvider.getTransactionConfirmations({
        hash: transactionReceipt.transactionHash,
      });

    callback?.({
      stage: TransactionCallbackStage.DONE,
      payload: confirmations,
    });

    return { hash: transaction, receipt: transactionReceipt, confirmations };
  }

  @Logger('LOG:')
  private async stakeMultisig(props: StakeInnerProps): Promise<StakeResult> {
    const { value, callback, referralAddress, account } = props;

    callback({ stage: TransactionCallbackStage.SIGN });

    const contract = await this.getContractStETH();
    const transaction = await contract.write.submit([referralAddress], {
      value,
      chain: this.core.chain,
      account,
    });

    callback({ stage: TransactionCallbackStage.MULTISIG_DONE });

    return { hash: transaction };
  }

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async stakeSimulateTx(
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
  @Cache(30 * 1000, ['core.chain.id'])
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
    gasLimit: bigint | undefined;
    overrides: {
      account: Account | Address;
      value: bigint;
      maxPriorityFeePerGas: bigint | undefined;
      maxFeePerGas: bigint | undefined;
    };
  }> {
    invariant(this.core.web3Provider, 'Web3 provider is not defined');

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
  private async validateStakeLimit(value: bigint): Promise<void> {
    const currentStakeLimit = (await this.getStakeLimitInfo())[3];

    if (value > currentStakeLimit) {
      throw this.core.error({
        message: `Stake value is greater than daily protocol staking limit (${currentStakeLimit})`,
      });
    }
  }

  @Logger('Utils:')
  private stakeEncodeData(props: StakeEncodeDataProps): Hash {
    const { referralAddress = zeroAddress } = props;

    return encodeFunctionData({
      abi: StethAbi,
      functionName: 'submit',
      args: [referralAddress],
    });
  }

  @Logger('Utils:')
  public async stakePopulateTx(
    props: StakeProps,
  ): Promise<Omit<FormattedTransactionRequest, 'type'>> {
    const { referralAddress, value, account } = this.parseProps(props);
    const data = this.stakeEncodeData({ referralAddress });
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

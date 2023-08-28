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
} from "viem";
import invariant from "tiny-invariant";
import { LidoSDKCore } from "../core/index.js";
import { ErrorHandler, Logger, Cache } from "../common/decorators/index.js";
import { TOKENS, getTokenAddress } from "@lido-sdk/constants";

import { SUBMIT_EXTRA_GAS_TRANSACTION_RATIO } from "../common/constants.js";
import { version } from "../version.js";

import { abi } from "./abi/steth.js";
import {
  LidoSDKStakingProps,
  StakeCallbackStage,
  StakeProps,
  StakeResult,
  StakeEncodeDataProps,
} from "./types.js";

export class LidoSDKStaking {
  readonly core: LidoSDKCore;

  constructor(props: LidoSDKStakingProps) {
    const { core, ...rest } = props;

    if (core) this.core = core;
    else this.core = new LidoSDKCore(rest, version);
  }

  // Balances

  @Logger("Balances:")
  @Cache(10 * 1000)
  public balanceStETH(address: Address): Promise<bigint> {
    return this.getContractStETH().read.balanceOf([address]);
  }

  // Contracts

  @Logger("Contracts:")
  @Cache(30 * 60 * 1000, ["core.chain.id"])
  public contractAddressStETH(): Address {
    invariant(this.core.chain, "Chain is not defined");
    return getTokenAddress(this.core.chain?.id, TOKENS.STETH) as Address;
  }

  @Logger("Contracts:")
  @Cache(30 * 60 * 1000, ["core.chain.id", "contractAddressStETH"])
  public getContractStETH(): GetContractReturnType<
    typeof abi,
    PublicClient,
    WalletClient
  > {
    return getContract({
      address: this.contractAddressStETH(),
      abi: abi,
      publicClient: this.core.rpcProvider,
      walletClient: this.core.web3Provider,
    });
  }

  // Calls

  @ErrorHandler("Call:")
  @Logger("Call:")
  public async stake(props: StakeProps): Promise<StakeResult> {
    invariant(this.core.web3Provider, "Web3 provider is not defined");

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

  @ErrorHandler("Call:")
  @Logger("LOG:")
  private async stakeEOA(props: StakeProps): Promise<StakeResult> {
    const { value, callback, referralAddress = zeroAddress, account } = props;

    invariant(this.core.rpcProvider, "RPC provider is not defined");
    invariant(this.core.web3Provider, "Web3 provider is not defined");
    // Checking the daily protocol staking limit
    await this.validateStakeLimit(value);

    const { gasLimit, overrides } = await this.submitGasLimit(
      account,
      value,
      referralAddress,
    );
    const address = await this.core.getWeb3Address();

    callback?.({ stage: StakeCallbackStage.SIGN });

    const transaction = await this.getContractStETH().write.submit(
      [referralAddress],
      {
        ...overrides,
        value: parseEther(value),
        chain: this.core.chain,
        gas: gasLimit,
        account: address,
      },
    );

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

  @ErrorHandler("Call:")
  @Logger("LOG:")
  private async stakeMultisig(props: StakeProps): Promise<StakeResult> {
    const { value, callback, referralAddress = zeroAddress } = props;

    const address = await this.core.getWeb3Address();

    callback?.({ stage: StakeCallbackStage.SIGN });

    const transaction = await this.getContractStETH().write.submit(
      [referralAddress],
      {
        value: parseEther(value),
        chain: this.core.chain,
        account: address,
      },
    );

    callback?.({ stage: StakeCallbackStage.MULTISIG_DONE });

    return { hash: transaction };
  }

  @ErrorHandler("Call:")
  @Logger("Call:")
  public async stakeSimulateTx(
    props: StakeProps,
  ): Promise<WriteContractParameters> {
    const { referralAddress = zeroAddress, value, account } = props;

    const { request } = await this.core.rpcProvider.simulateContract({
      address: this.contractAddressStETH(),
      abi,
      functionName: "submit",
      account,
      args: [referralAddress],
      value: parseEther(value),
    });

    return request;
  }

  // Views

  @ErrorHandler("Views:")
  @Logger("Views:")
  @Cache(30 * 1000, ["core.chain.id"])
  public getStakeLimitInfo() {
    return this.getContractStETH().read.getStakeLimitFullInfo();
  }

  // Utils

  @ErrorHandler("Call:")
  @Logger("Utils:")
  @Cache(30 * 1000, ["core.chain.id"])
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
    invariant(this.core.web3Provider, "Web3 provider is not defined");

    const feeData = await this.core.getFeeData();

    const overrides = {
      account,
      value: parseEther(value),
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ?? undefined,
      maxFeePerGas: feeData.maxFeePerGas ?? undefined,
    };

    const originalGasLimit = await this.getContractStETH().estimateGas.submit(
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

  @ErrorHandler("Utils:")
  @Logger("Utils:")
  private async validateStakeLimit(value: string): Promise<void> {
    const currentStakeLimit = (await this.getStakeLimitInfo())[3];
    const parsedValue = parseEther(value);

    if (parsedValue > currentStakeLimit) {
      throw this.core.error({
        message: `Stake value is greater than daily protocol staking limit (${currentStakeLimit})`,
      });
    }
  }

  @ErrorHandler("Utils:")
  @Logger("Utils:")
  private stakeEncodeData(props: StakeEncodeDataProps): Hash {
    const { referralAddress = zeroAddress } = props;

    return encodeFunctionData({
      abi,
      functionName: "submit",
      args: [referralAddress],
    });
  }

  @ErrorHandler("Utils:")
  @Logger("Utils:")
  public stakePopulateTx(
    props: StakeProps,
  ): Omit<FormattedTransactionRequest, "type"> {
    const { referralAddress = zeroAddress, value, account } = props;

    const data = this.stakeEncodeData({ referralAddress });

    return {
      to: this.contractAddressStETH(),
      from: account,
      value: parseEther(value),
      data,
    };
  }
}

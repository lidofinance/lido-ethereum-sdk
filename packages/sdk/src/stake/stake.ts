import {
  zeroAddress,
  parseEther,
  getContract,
  type Address,
  type Account,
  type GetContractReturnType,
  type PublicClient,
  type WalletClient,
} from "viem";
import invariant from "tiny-invariant";
import { LidoSDKCore } from "../core/index.js";
import { ErrorHandler, Logger, Cache } from "../common/decorators/index.js";
import { TOKENS, getTokenAddress } from "@lido-sdk/constants";

import { SUBMIT_EXTRA_GAS_TRANSACTION_RATIO } from "../common/constants.js";
import { version } from "../version.js";
import { abi } from "./abi/abi.js";
import {
  LidoSDKStakeProps,
  StakeCallbackStage,
  StakeProps,
  StakeResult,
} from "./types.js";

export class LidoSDKStake {
  protected core: LidoSDKCore;
  protected contractStETH:
    | GetContractReturnType<typeof abi, PublicClient, WalletClient>
    | undefined;

  constructor(props: LidoSDKStakeProps) {
    const { core, ...rest } = props;

    if (core) this.core = core;
    else this.core = new LidoSDKCore(rest, version);
  }

  // Balances

  @Logger("Balances:")
  public balanceStETH(address: Address): Promise<bigint> {
    return this.getContractStETH().read.balanceOf([address]);
  }

  // Contracts

  @Logger("Contracts:")
  @Cache(60 * 1000)
  public contractAddressStETH(): Address {
    invariant(this.core.chain, "Chain is not defined");
    return getTokenAddress(this.core.chain?.id, TOKENS.STETH) as Address;
  }

  @Logger("Contracts:")
  public getContractStETH(): GetContractReturnType<
    typeof abi,
    PublicClient,
    WalletClient
  > {
    if (this.contractStETH) return this.contractStETH;

    this.contractStETH = getContract({
      address: this.contractAddressStETH(),
      abi: abi,
      publicClient: this.core.rpcProvider,
      walletClient: this.core.web3Provider,
    });

    return this.contractStETH;
  }

  // Calls

  @ErrorHandler("Call:")
  @Logger("Call:")
  public async stake(props: StakeProps): Promise<StakeResult> {
    const { callback } = props;
    try {
      const address = await this.core.getWeb3Address();
      const isContract = await this.core.isContract(address);

      if (isContract) return await this.stakeMultisig(props);
      else return await this.stakeEOA(props);
    } catch (error) {
      const { message, code } = this.core.getErrorMessage(error);
      const txError = this.core.error({
        message,
        error,
        code,
      });
      callback({ stage: StakeCallbackStage.ERROR, payload: txError });

      throw txError;
    }
  }

  @ErrorHandler("Call:")
  @Logger("LOG:")
  private async stakeEOA(props: StakeProps): Promise<StakeResult> {
    const { value, callback, referralAddress = zeroAddress } = props;

    invariant(this.core.rpcProvider, "RPC provider is not defined");
    invariant(this.core.web3Provider, "Web3 provider is not defined");
    // Checking the daily protocol staking limit
    await this.validateStakeLimit(value);

    const { gasLimit, overrides } = await this.submitGasLimit(
      value,
      referralAddress
    );
    const address = await this.core.getWeb3Address();

    callback({ stage: StakeCallbackStage.SIGN });

    const transaction = await this.getContractStETH().write.submit(
      [referralAddress],
      {
        ...overrides,
        value: parseEther(value),
        chain: this.core.chain,
        gas: gasLimit,
        account: address,
      }
    );

    callback({ stage: StakeCallbackStage.RECEIPT, payload: transaction });

    const transactionReceipt =
      await this.core.rpcProvider.waitForTransactionReceipt({
        hash: transaction,
      });

    callback({
      stage: StakeCallbackStage.CONFIRMATION,
      payload: transactionReceipt,
    });

    const confirmations =
      await this.core.rpcProvider.getTransactionConfirmations({
        hash: transactionReceipt.transactionHash,
      });

    callback({ stage: StakeCallbackStage.DONE, payload: confirmations });

    return { hash: transaction, receipt: transactionReceipt, confirmations };
  }

  @ErrorHandler("Call:")
  @Logger("LOG:")
  private async stakeMultisig(props: StakeProps): Promise<StakeResult> {
    const { value, callback, referralAddress = zeroAddress } = props;

    const address = await this.core.getWeb3Address();

    callback({ stage: StakeCallbackStage.SIGN });

    const transaction = await this.getContractStETH().write.submit(
      [referralAddress],
      {
        value: parseEther(value),
        chain: this.core.chain,
        account: address,
      }
    );

    callback({ stage: StakeCallbackStage.MULTISIG_DONE });

    return { hash: transaction };
  }

  // Views

  @ErrorHandler("Views:")
  @Cache(30 * 1000)
  @Logger("Views:")
  public getStakeLimitInfo() {
    return this.getContractStETH().read.getStakeLimitFullInfo();
  }

  // Utils

  @ErrorHandler("Call:")
  @Cache(30 * 1000)
  @Logger("Utils:")
  private async submitGasLimit(
    value: string,
    referralAddress: Address = zeroAddress
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

    const address = await this.core.getWeb3Address();
    const feeData = await this.core.getFeeData();

    const overrides = {
      account: address,
      value: parseEther(value),
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ?? undefined,
      maxFeePerGas: feeData.maxFeePerGas ?? undefined,
    };

    const originalGasLimit = await this.getContractStETH().estimateGas.submit(
      [referralAddress],
      overrides
    );
    const gasLimit = originalGasLimit
      ? BigInt(
          Math.ceil(
            Number(originalGasLimit) * SUBMIT_EXTRA_GAS_TRANSACTION_RATIO
          )
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
}

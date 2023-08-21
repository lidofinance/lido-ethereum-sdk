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
import {
  LidoSDKCore,
  ErrorHandler,
  Logger,
  Cache,
} from "@lidofinance/lido-sdk-core";
import { TOKENS, getTokenAddress } from "@lido-sdk/constants";
import {} from "@lido-sdk/contracts/dist/cjs";

import { SUBMIT_EXTRA_GAS_TRANSACTION_RATIO } from "./common/constants";
import { version } from "./version";
import { abi } from "./abi/abi";
import { LidoSDKStakeProps, StakeCallbackStage, StakeProps } from "./types";

// TODO: move to constants

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
  @Cache(30 * 1000)
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
  public async stake(props: StakeProps): Promise<void> {
    const address = await this.core.getWeb3Address();
    const isContract = await this.core.isContract(address);

    if (isContract) await this.stakeMultisig(props);
    else await this.stakeEOA(props);
  }

  @ErrorHandler("Call:")
  @Logger("LOG:")
  private async stakeEOA(props: StakeProps): Promise<void> {
    const { value, callback, referralAddress = zeroAddress } = props;

    invariant(this.core.rpcProvider, "RPC provider is not defined");
    invariant(this.core.web3Provider, "Web3 provider is not defined");
    // Checking the daily protocol staking limit
    await this.checkStakeLimit(value);

    const { gasLimit, overrides } = await this.submitGasLimit(
      value,
      referralAddress
    );
    const address = await this.core.getWeb3Address();

    callback(StakeCallbackStage.SIGN);

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

    callback(StakeCallbackStage.RECEIPT, transaction);

    const transactionReceipt =
      await this.core.rpcProvider.waitForTransactionReceipt({
        hash: transaction,
      });

    callback(StakeCallbackStage.CONFIRMATION, transactionReceipt);

    const confirmations =
      await this.core.rpcProvider.getTransactionConfirmations({
        hash: transactionReceipt.transactionHash,
      });

    callback(StakeCallbackStage.DONE, confirmations);
  }

  @ErrorHandler("Call:")
  @Logger("LOG:")
  private async stakeMultisig(props: StakeProps): Promise<void> {
    const { value, callback, referralAddress = zeroAddress } = props;

    const address = await this.core.getWeb3Address();

    await this.getContractStETH().write.submit([referralAddress], {
      value: parseEther(value),
      chain: this.core.chain,
      account: address,
    });

    callback(StakeCallbackStage.MULTISIG_DONE);
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
  private async checkStakeLimit(value: string): Promise<void> {
    const currentStakeLimit = (await this.getStakeLimitInfo())[3];
    const parsedValue = parseEther(value);

    if (parsedValue > currentStakeLimit) {
      throw new Error(
        `Stake value is greater than daily protocol staking limit (${currentStakeLimit})`
      );
    }
  }
}

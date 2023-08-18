import {
  LidoSDKCore,
  type LidoSDKCoreProps,
  ErrorHandler,
  Logger,
  Cache,
} from "@lidofinance/lido-sdk-core";
import { CHAINS, TOKENS, getTokenAddress } from "@lido-sdk/constants";
import {} from "@lido-sdk/contracts/dist/cjs";
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

import { abi } from "./abi/abi";

// TODO: move to constants
const SUBMIT_EXTRA_GAS_TRANSACTION_RATIO = 1.05;

export class LidoSDKStake extends LidoSDKCore {
  constructor(props: LidoSDKCoreProps) {
    super(props);
  }

  // Balances

  @Logger("Balances:")
  public balanceStETH(address: Address): Promise<bigint> {
    return this.contractStETH().read.balanceOf([address]);
  }

  // Contracts

  @Logger("Contracts:")
  public contractAddressStETH(): Address {
    return getTokenAddress(
      this.chain || CHAINS.Mainnet,
      TOKENS.STETH
    ) as Address;
  }

  @Logger("Contracts:")
  public contractStETH(): GetContractReturnType<
    typeof abi,
    PublicClient,
    WalletClient
  > {
    return getContract({
      address: this.contractAddressStETH(),
      abi: abi,
      publicClient: this.provider,
      walletClient: this.web3Provider,
    });
  }

  // Calls

  @ErrorHandler("CALL:")
  public async stake(
    value: string,
    referralAddress: Address = zeroAddress
  ): Promise<void> {
    // Checking the daily protocol staking limit
    await this.checkStakeLimit(value);

    const { gasLimit, overrides } = await this.submitGasLimit(
      value,
      referralAddress
    );

    const transaction = await this.contractStETH().write.submit(
      [referralAddress],
      {
        ...overrides,
        chain: null,
        gas: gasLimit,
      }
    );

    await this.provider?.waitForTransactionReceipt({ hash: transaction });
  }

  // Views

  @ErrorHandler("Views:")
  @Cache(30 * 1000)
  @Logger("Views:")
  public getStakeLimitInfo() {
    return this.contractStETH().read.getStakeLimitFullInfo();
  }

  // Utils

  @ErrorHandler("Call:")
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
    const feeData = await this.getFeeData();
    const overrides = {
      account: this.web3Provider?.account || zeroAddress,
      value: parseEther(value),
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ?? undefined,
      maxFeePerGas: feeData.maxFeePerGas ?? undefined,
    };

    const originalGasLimit = await this.contractStETH().estimateGas.submit(
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

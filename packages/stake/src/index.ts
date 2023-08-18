import {
  LidoSDKCore,
  LidoSDKCoreProps,
  ErrorHandler,
  Logger,
  Cache,
} from "@lidofinance/lido-sdk-core";
import { AddressZero } from "@ethersproject/constants";
import { parseEther } from "@ethersproject/units";
import { BigNumber } from "@ethersproject/bignumber";
import { CHAINS, TOKENS, getTokenAddress } from "@lido-sdk/constants";
import { StethAbi, getSTETHContract } from "@lido-sdk/contracts";

// TODO: move to constants
const SUBMIT_EXTRA_GAS_TRANSACTION_RATIO = 1.05;

export class LidoSDKStake extends LidoSDKCore {
  constructor(props: LidoSDKCoreProps) {
    super(props);
  }

  // Balances

  @Logger("Balances:")
  public balanceStETH(address: string): Promise<BigNumber> {
    return this.contractStETH().balanceOf(address);
  }

  // Contracts

  @Logger("Contracts:")
  public contractAddressStETH(): string {
    return getTokenAddress(this.chain || CHAINS.Mainnet, TOKENS.STETH);
  }

  @Logger("Contracts:")
  public contractStETH(): StethAbi {
    return getSTETHContract(this.contractAddressStETH(), this.provider!);
  }

  // Calls

  @ErrorHandler("CALL:")
  public async stake(
    value: string,
    referralAddress = AddressZero
  ): Promise<void> {
    // Checking the daily protocol staking limit
    await this.checkStakeLimit(value);

    const { gasLimit, overrides } = await this.submitGasLimit(
      value,
      referralAddress
    );

    const transaction = await this.contractStETH().submit(
      referralAddress || AddressZero,
      {
        ...overrides,
        gasLimit,
      }
    );

    if (typeof transaction === "object") {
      await transaction.wait();
    }
  }

  // Views

  @ErrorHandler("Views:")
  @Cache(30 * 1000)
  @Logger("Views:")
  public getStakeLimitInfo(): ReturnType<StethAbi["getStakeLimitFullInfo"]> {
    return this.contractStETH().getStakeLimitFullInfo();
  }

  // Utils

  @ErrorHandler("Call:")
  @Logger("Utils:")
  private async submitGasLimit(
    value: string,
    referralAddress = AddressZero
  ): Promise<{
    gasLimit: BigNumber | undefined;
    overrides: {
      value: BigNumber;
      maxPriorityFeePerGas: BigNumber | undefined;
      maxFeePerGas: BigNumber | undefined;
    };
  }> {
    const feeData = await this.getFeeData();
    const overrides = {
      value: parseEther(value),
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ?? undefined,
      maxFeePerGas: feeData.maxFeePerGas ?? undefined,
    };

    const originalGasLimit = await this.contractStETH().estimateGas.submit(
      referralAddress,
      overrides
    );
    const gasLimit = originalGasLimit
      ? BigNumber.from(
          Math.ceil(
            originalGasLimit.toNumber() * SUBMIT_EXTRA_GAS_TRANSACTION_RATIO
          )
        )
      : undefined;

    return { gasLimit, overrides };
  }

  @ErrorHandler("Utils:")
  @Logger("Utils:")
  private async checkStakeLimit(value: string): Promise<void> {
    const { currentStakeLimit } = await this.getStakeLimitInfo();
    const parsedValue = parseEther(value);

    if (parsedValue.gt(currentStakeLimit)) {
      throw new Error(
        `Stake value is greater than daily protocol staking limit (${currentStakeLimit})`
      );
    }
  }
}

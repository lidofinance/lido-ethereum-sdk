import { LidoSDKCore } from "@lidofinance/lido-sdk-core";
import { AddressZero } from "@ethersproject/constants";
import { parseEther } from "@ethersproject/units";
import { BigNumber } from "@ethersproject/bignumber";

import { ErrorHandler, Logger } from "@common/utils/decorators";

// TODO: move to constants
const SUBMIT_EXTRA_GAS_TRANSACTION_RATIO = 1.05;

export class LidoSDKStake {
  protected core: LidoSDKCore;

  constructor(core: LidoSDKCore) {
    this.core = core;
  }

  // Calls

  @ErrorHandler("CALL:")
  public async stake(
    value: string,
    referralAddress = AddressZero
  ): Promise<void> {
    const { gasLimit, overrides } = await this.submitGasLimit(
      value,
      referralAddress
    );

    const transaction = await this.core
      .contractStETH()
      .submit(referralAddress || AddressZero, {
        ...overrides,
        gasLimit,
      });

    if (typeof transaction === "object") {
      await transaction.wait();
    }
  }

  // utils

  @ErrorHandler("CALL:")
  @Logger("Utils")
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
    const feeData = await this.core.getFeeData();
    const overrides = {
      value: parseEther(value),
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ?? undefined,
      maxFeePerGas: feeData.maxFeePerGas ?? undefined,
    };

    const originalGasLimit = await this.core
      .contractStETH()
      .estimateGas.submit(referralAddress, overrides);
    const gasLimit = originalGasLimit
      ? BigNumber.from(
          Math.ceil(
            originalGasLimit.toNumber() * SUBMIT_EXTRA_GAS_TRANSACTION_RATIO
          )
        )
      : undefined;

    return { gasLimit, overrides };
  }
}

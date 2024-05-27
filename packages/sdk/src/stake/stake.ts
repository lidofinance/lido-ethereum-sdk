import {
  zeroAddress,
  getContract,
  encodeFunctionData,
  decodeEventLog,
  getAbiItem,
  toEventSignature,
  isAddressEqual,
} from 'viem';

import type {
  Address,
  GetContractReturnType,
  WalletClient,
  Hash,
  WriteContractParameters,
  TransactionReceipt,
} from 'viem';

import {
  type TransactionResult,
  type PopulatedTransaction,
  TransactionOptions,
} from '../core/index.js';
import { ERROR_CODE, invariant } from '../common/utils/sdk-error.js';
import { Logger, Cache, ErrorHandler } from '../common/decorators/index.js';
import {
  SUBMIT_EXTRA_GAS_TRANSACTION_RATIO,
  LIDO_CONTRACT_NAMES,
  NOOP,
  GAS_TRANSACTION_RATIO_PRECISION,
} from '../common/constants.js';
import { parseValue } from '../common/utils/parse-value.js';

import { StethAbi, StethEventsPartialAbi } from './abi/steth.js';
import type {
  StakeProps,
  StakeEncodeDataProps,
  StakeInnerProps,
  StakeLimitResult,
  StakeResult,
} from './types.js';
import { LidoSDKModule } from '../common/class-primitives/sdk-module.js';

export class LidoSDKStake extends LidoSDKModule {
  // Precomputed event signatures
  private static TRANSFER_SIGNATURE = toEventSignature(
    getAbiItem({ abi: StethEventsPartialAbi, name: 'Transfer' }),
  );
  private static TRANSFER_SHARES_SIGNATURE = toEventSignature(
    getAbiItem({ abi: StethEventsPartialAbi, name: 'TransferShares' }),
  );
  // Contracts

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['core.chain.id'])
  public async contractAddressStETH(): Promise<Address> {
    return await this.core.getContractAddress(LIDO_CONTRACT_NAMES.lido);
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['core.chain.id', 'contractAddressStETH'])
  public async getContractStETH(): Promise<
    GetContractReturnType<typeof StethAbi, WalletClient>
  > {
    const address = await this.contractAddressStETH();

    return getContract({
      address,
      abi: StethAbi,
      client: {
        public: this.core.rpcProvider,
        wallet: this.core.web3Provider as WalletClient,
      },
    });
  }

  // Calls

  @Logger('Call:')
  @ErrorHandler()
  public async stakeEth(
    props: StakeProps,
  ): Promise<TransactionResult<StakeResult>> {
    this.core.useWeb3Provider();
    const { callback, account, referralAddress, value, ...rest } =
      await this.parseProps(props);

    await this.validateStakeLimit(value);
    const { address } = await this.core.useAccount(account);
    const contract = await this.getContractStETH();
    return this.core.performTransaction<StakeResult>({
      ...rest,
      callback,
      account,
      getGasLimit: async (options) =>
        this.submitGasLimit(value, referralAddress, options),
      sendTransaction: (options) =>
        contract.write.submit([referralAddress], { ...options, value }),
      decodeResult: async (receipt) => this.submitParseEvents(receipt, address),
    });
  }

  @Logger('Call:')
  @ErrorHandler()
  public async stakeEthSimulateTx(
    props: StakeProps,
  ): Promise<WriteContractParameters> {
    const { referralAddress, value, account } = await this.parseProps(props);
    const contract = await this.getContractStETH();
    const { request } = await contract.simulate.submit([referralAddress], {
      account,
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
  private submitParseEvents(
    receipt: TransactionReceipt,
    address: Address,
  ): StakeResult {
    let stethReceived: bigint | undefined;
    let sharesReceived: bigint | undefined;
    for (const log of receipt.logs) {
      // skips non-relevant events
      if (
        log.topics[0] !== LidoSDKStake.TRANSFER_SIGNATURE &&
        log.topics[0] !== LidoSDKStake.TRANSFER_SHARES_SIGNATURE
      )
        continue;
      const parsedLog = decodeEventLog({
        abi: StethEventsPartialAbi,
        strict: true,
        ...log,
      });
      if (
        parsedLog.eventName === 'Transfer' &&
        isAddressEqual(parsedLog.args.to, address)
      ) {
        stethReceived = parsedLog.args.value;
      } else if (
        parsedLog.eventName === 'TransferShares' &&
        isAddressEqual(parsedLog.args.to, address)
      ) {
        sharesReceived = parsedLog.args.sharesValue;
      }
    }
    invariant(
      stethReceived,
      'could not find Transfer event in stake transaction',
      ERROR_CODE.TRANSACTION_ERROR,
    );
    invariant(
      sharesReceived,
      'could not find TransferShares event in stake transaction',
      ERROR_CODE.TRANSACTION_ERROR,
    );
    return { sharesReceived, stethReceived };
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
    const { referralAddress, value, account } = await this.parseProps(props);
    const data = this.stakeEthEncodeData({ referralAddress });
    const address = await this.contractAddressStETH();
    return {
      to: address,
      from: account.address,
      value,
      data,
    };
  }

  private async parseProps(props: StakeProps): Promise<StakeInnerProps> {
    return {
      ...props,
      account: await this.core.useAccount(props.account),
      referralAddress: props.referralAddress ?? zeroAddress,
      value: parseValue(props.value),
      callback: props.callback ?? NOOP,
    };
  }
}

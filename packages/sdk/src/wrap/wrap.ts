import {
  getContract,
  encodeFunctionData,
  type Address,
  type GetContractReturnType,
  type WalletClient,
  type FormattedTransactionRequest,
  type WriteContractParameters,
  TransactionReceipt,
  decodeEventLog,
  getAbiItem,
  toEventHash,
  isAddressEqual,
  zeroAddress,
} from 'viem';

import {
  GAS_TRANSACTION_RATIO_PRECISION,
  LIDO_CONTRACT_NAMES,
  NOOP,
  SUBMIT_EXTRA_GAS_TRANSACTION_RATIO,
} from '../common/constants.js';
import {
  AccountValue,
  EtherValue,
  PopulatedTransaction,
  TransactionOptions,
  TransactionResult,
} from '../core/types.js';
import { parseValue } from '../common/utils/parse-value.js';
import { Logger, Cache, ErrorHandler } from '../common/decorators/index.js';

import type {
  WrapProps,
  WrapInnerProps,
  WrapPropsWithoutCallback,
  WrapResults,
  UnwrapResults,
} from './types.js';

import { abi } from './abi/wsteth.js';
import { abi as wstethReferralStakerAbi } from './abi/wsteth-referral-staker.js';
import {
  stethPartialAbi,
  PartialTransferEventAbi,
} from './abi/steth-partial.js';
import { ERROR_CODE, invariant } from '../common/utils/sdk-error.js';
import { LidoSDKModule } from '../common/class-primitives/sdk-module.js';

export class LidoSDKWrap extends LidoSDKModule {
  private static TRANSFER_SIGNATURE = toEventHash(
    getAbiItem({ abi: PartialTransferEventAbi, name: 'Transfer' }),
  );

  // Contracts

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['core.chain.id'])
  public async contractAddressWstETH(): Promise<Address> {
    return await this.core.getContractAddress(LIDO_CONTRACT_NAMES.wsteth);
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['core.chain.id', 'contractAddressWstETH'])
  public async getContractWstETH(): Promise<
    GetContractReturnType<typeof abi, WalletClient>
  > {
    const address = await this.contractAddressWstETH();

    return getContract({
      address,
      abi: abi,
      client: {
        public: this.core.rpcProvider,
        wallet: this.core.web3Provider as WalletClient,
      },
    });
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['core.chain.id'])
  private async getPartialContractSteth(): Promise<
    GetContractReturnType<typeof stethPartialAbi, WalletClient>
  > {
    const address = await this.core.getContractAddress(
      LIDO_CONTRACT_NAMES.lido,
    );

    return getContract({
      address,
      abi: stethPartialAbi,
      client: {
        public: this.core.rpcProvider,
        wallet: this.core.web3Provider as WalletClient,
      },
    });
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['core.chain.id'])
  public async contractAddressWstETHReferralStaker(): Promise<Address> {
    return await this.core.getContractAddress(
      LIDO_CONTRACT_NAMES.wstethReferralStaker,
    );
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['core.chain.id', 'contractAddressWstETHReferralStaker'])
  public async getContractWstETHReferralStaker(): Promise<
    GetContractReturnType<typeof wstethReferralStakerAbi, WalletClient>
    > {
    const address = await this.contractAddressWstETHReferralStaker();

    return getContract({
      address,
      abi: wstethReferralStakerAbi,
      client: {
        public: this.core.rpcProvider,
        wallet: this.core.web3Provider as WalletClient,
      },
    });
  }

  // Calls

  @Logger('Call:')
  @ErrorHandler()
  public async wrapEth(
    props: WrapProps,
  ): Promise<TransactionResult<WrapResults>> {
    this.core.useWeb3Provider();
    const { account, callback, value, referralAddress, ...rest } = await this.parseProps(props);
    const contract = await this.getContractWstETHReferralStaker();

    await this.validateStakeLimit(value);

    return this.core.performTransaction({
      ...rest,
      account,
      callback,
      getGasLimit: (options) =>
        contract.estimateGas.stakeETH([referralAddress], {
          value,
          account, // TODO
          ...options,
        }),
      sendTransaction: (options) =>
        contract.write.stakeETH([referralAddress], {
          value,
          account, // TODO
          ...options,
        }),
      decodeResult: (receipt) => this.wrapParseEvents(receipt, account.address),
    });
  }

  @Logger('Utils:')
  @ErrorHandler()
  public async wrapEthEstimateGas(
    props: WrapPropsWithoutCallback,
    options?: TransactionOptions,
  ): Promise<bigint> {
    const { value, account, referralAddress } = await this.parseProps(props);
    const contract = await this.getContractWstETHReferralStaker();

    const originalGasLimit = await contract.estimateGas.stakeETH([referralAddress], {
      value,
      account,
      ...options,
    });

    return (
      (originalGasLimit *
        BigInt(
          GAS_TRANSACTION_RATIO_PRECISION * SUBMIT_EXTRA_GAS_TRANSACTION_RATIO,
        )) /
      BigInt(GAS_TRANSACTION_RATIO_PRECISION)
    );
  }

  @Logger('Utils:')
  public async wrapEthPopulateTx(
    props: WrapPropsWithoutCallback,
  ): Promise<PopulatedTransaction> {
    const { value, account, referralAddress } = await this.parseProps(props);
    const to = await this.contractAddressWstETHReferralStaker();

    return {
      to,
      from: account.address,
      value,
      data: encodeFunctionData({
        abi: wstethReferralStakerAbi,
        functionName: 'stakeETH',
        args: [referralAddress],
      }),
    };
  }

  /// Wrap stETH

  @Logger('Call:')
  @ErrorHandler()
  public async wrapSteth(
    props: WrapProps,
  ): Promise<TransactionResult<WrapResults>> {
    this.core.useWeb3Provider();
    const { account, callback, value, ...rest } = await this.parseProps(props);
    const contract = await this.getContractWstETH();

    return this.core.performTransaction<WrapResults>({
      ...rest,
      account,
      callback,
      getGasLimit: (options) => contract.estimateGas.wrap([value], options),
      sendTransaction: (options) => contract.write.wrap([value], options),
      decodeResult: (receipt) => this.wrapParseEvents(receipt, account.address),
    });
  }

  @Logger('Utils:')
  public async wrapStethEstimateGas(
    props: WrapPropsWithoutCallback,
    options?: TransactionOptions,
  ): Promise<bigint> {
    const { value, account } = await this.parseProps(props);
    const contract = await this.getContractWstETH();

    return await contract.estimateGas.wrap([value], { account, ...options });
  }

  @Logger('Utils:')
  public async wrapStethPopulateTx(
    props: WrapPropsWithoutCallback,
  ): Promise<PopulatedTransaction> {
    const { value, account } = await this.parseProps(props);
    const address = await this.contractAddressWstETH();

    return {
      to: address,
      from: account.address,
      data: encodeFunctionData({
        abi,
        functionName: 'wrap',
        args: [value],
      }),
    };
  }

  @Logger('Call:')
  @ErrorHandler()
  public async wrapStethSimulateTx(
    props: WrapPropsWithoutCallback,
  ): Promise<WriteContractParameters> {
    const { value, account } = await this.parseProps(props);
    const contract = await this.getContractWstETH();

    const { request } = await contract.simulate.wrap([value], {
      account,
    });

    return request;
  }

  /// Approve

  @Logger('Call:')
  @ErrorHandler()
  public async approveStethForWrap(
    props: WrapProps,
  ): Promise<TransactionResult> {
    this.core.useWeb3Provider();
    const { account, callback, value, ...rest } = await this.parseProps(props);
    const stethContract = await this.getPartialContractSteth();
    const wstethContractAddress = await this.contractAddressWstETH();

    return this.core.performTransaction({
      ...rest,
      account,
      callback,
      getGasLimit: (options) =>
        stethContract.estimateGas.approve(
          [wstethContractAddress, value],
          options,
        ),
      sendTransaction: (options) =>
        stethContract.write.approve([wstethContractAddress, value], options),
    });
  }

  @Logger('Utils:')
  @ErrorHandler()
  public async getStethForWrapAllowance(
    account?: AccountValue,
  ): Promise<bigint> {
    const parsedAccount = await this.core.useAccount(account);
    const stethContract = await this.getPartialContractSteth();
    const wstethAddress = await this.contractAddressWstETH();
    return stethContract.read.allowance([parsedAccount.address, wstethAddress]);
  }

  @Logger('Utils:')
  public async approveStethForWrapPopulateTx(
    props: WrapPropsWithoutCallback,
  ): Promise<Omit<FormattedTransactionRequest, 'type'>> {
    const { value, account } = await this.parseProps(props);

    const stethContract = await this.getPartialContractSteth();
    const wstethContractAddress = await this.contractAddressWstETH();

    return {
      to: stethContract.address,
      from: account.address,
      data: encodeFunctionData({
        abi: stethPartialAbi,
        functionName: 'approve',
        args: [wstethContractAddress, value],
      }),
    };
  }

  @Logger('Utils:')
  public async approveStethForWrapEstimateGas(
    props: WrapPropsWithoutCallback,
    options?: TransactionOptions,
  ): Promise<bigint> {
    const { value, account } = await this.parseProps(props);

    const stethContract = await this.getPartialContractSteth();
    const wstethContractAddress = await this.contractAddressWstETH();

    return await stethContract.estimateGas.approve(
      [wstethContractAddress, value],
      { account, ...options },
    );
  }

  @Logger('Call:')
  @ErrorHandler()
  public async approveStethForWrapSimulateTx(
    props: WrapPropsWithoutCallback,
  ): Promise<WriteContractParameters> {
    const { value, account } = await this.parseProps(props);
    const stethContract = await this.getPartialContractSteth();
    const wstethContractAddress = await this.contractAddressWstETH();

    const { request } = await stethContract.simulate.approve(
      [wstethContractAddress, value],
      {
        account,
      },
    );
    return request;
  }

  /// Unwrap

  @Logger('Call:')
  @ErrorHandler()
  public async unwrap(
    props: WrapProps,
  ): Promise<TransactionResult<UnwrapResults>> {
    this.core.useWeb3Provider();
    const { account, callback, value, ...rest } = await this.parseProps(props);
    const contract = await this.getContractWstETH();

    return this.core.performTransaction({
      ...rest,
      account,
      callback,
      getGasLimit: (options) => contract.estimateGas.unwrap([value], options),
      sendTransaction: (options) => contract.write.unwrap([value], options),
      decodeResult: (receipt) =>
        this.unwrapParseEvents(receipt, account.address),
    });
  }

  @Logger('Utils:')
  public async unwrapPopulateTx(
    props: Omit<WrapProps, 'callback'>,
  ): Promise<PopulatedTransaction> {
    const { value, account } = await this.parseProps(props);
    const to = await this.contractAddressWstETH();

    return {
      to,
      from: account.address,
      data: encodeFunctionData({
        abi: abi,
        functionName: 'unwrap',
        args: [value],
      }),
    };
  }

  @Logger('Utils:')
  public async unwrapEstimateGas(
    props: Omit<WrapProps, 'callback'>,
    options?: TransactionOptions,
  ): Promise<bigint> {
    const { value, account } = await this.parseProps(props);
    const contract = await this.getContractWstETH();
    return contract.estimateGas.unwrap([value], { account, ...options });
  }

  @Logger('Call:')
  @ErrorHandler()
  public async unwrapSimulateTx(
    props: Omit<WrapProps, 'callback'>,
  ): Promise<WriteContractParameters> {
    const { value, account } = await this.parseProps(props);
    const contract = await this.getContractWstETH();

    const { request } = await contract.simulate.unwrap([value], {
      account,
    });

    return request;
  }

  /// Views

  @Logger('Views:')
  @ErrorHandler()
  public async convertStethToWsteth(steth_value: EtherValue): Promise<bigint> {
    const value = parseValue(steth_value);
    const contract = await this.getContractWstETH();
    return contract.read.getWstETHByStETH([value]);
  }

  @Logger('Views:')
  @ErrorHandler()
  public async convertWstethToSteth(wsteth_value: EtherValue): Promise<bigint> {
    const value = parseValue(wsteth_value);
    const contract = await this.getContractWstETH();
    return contract.read.getStETHByWstETH([value]);
  }

  /// Utils

  @Logger('Utils:')
  private async validateStakeLimit(value: bigint): Promise<void> {
    const stakeContract = await this.getPartialContractSteth();
    const currentStakeLimit = (
      await stakeContract.read.getStakeLimitFullInfo()
    )[3];

    if (value > currentStakeLimit) {
      throw this.core.error({
        code: ERROR_CODE.TRANSACTION_ERROR,
        message: `Stake value is greater than daily protocol staking limit (${currentStakeLimit})`,
      });
    }
  }

  @Logger('Utils:')
  private async parseProps(props: WrapProps): Promise<WrapInnerProps> {
    return {
      ...props,
      account: await this.core.useAccount(props.account),
      value: parseValue(props.value),
      referralAddress: props.referralAddress ?? zeroAddress,
      callback: props.callback ?? NOOP,
    };
  }

  @Logger('Utils:')
  private async wrapParseEvents(
    receipt: TransactionReceipt,
    address: Address,
  ): Promise<WrapResults> {
    const wstethAddress = await this.contractAddressWstETH();

    let stethWrapped: bigint | undefined;
    let wstethReceived: bigint | undefined;
    for (const log of receipt.logs) {
      // skips non-relevant events
      if (log.topics[0] !== LidoSDKWrap.TRANSFER_SIGNATURE) continue;
      const parsedLog = decodeEventLog({
        // fits both wsteth and steth events
        abi: PartialTransferEventAbi,
        strict: true,
        ...log,
      });
      if (isAddressEqual(parsedLog.args.to, address)) {
        wstethReceived = parsedLog.args.value;
      } else if (isAddressEqual(parsedLog.args.to, wstethAddress)) {
        stethWrapped = parsedLog.args.value;
      }
    }
    invariant(
      stethWrapped,
      'could not find Transfer event in wrap transaction',
      ERROR_CODE.TRANSACTION_ERROR,
    );
    invariant(
      wstethReceived,
      'could not find Transfer event in wrap transaction',
      ERROR_CODE.TRANSACTION_ERROR,
    );
    return {
      stethWrapped,
      wstethReceived,
    };
  }

  @Logger('Utils:')
  private async unwrapParseEvents(
    receipt: TransactionReceipt,
    address: Address,
  ): Promise<UnwrapResults> {
    let stethReceived: bigint | undefined;
    let wstethUnwrapped: bigint | undefined;
    for (const log of receipt.logs) {
      // skips non-relevant events
      if (log.topics[0] !== LidoSDKWrap.TRANSFER_SIGNATURE) continue;
      const parsedLog = decodeEventLog({
        abi: PartialTransferEventAbi,
        strict: true,
        ...log,
      });
      if (isAddressEqual(parsedLog.args.from, address)) {
        wstethUnwrapped = parsedLog.args.value;
      } else if (isAddressEqual(parsedLog.args.to, address)) {
        stethReceived = parsedLog.args.value;
      }
    }
    invariant(
      stethReceived,
      'could not find Transfer event in unwrap transaction',
      ERROR_CODE.TRANSACTION_ERROR,
    );
    invariant(
      wstethUnwrapped,
      'could not find Transfer event in unwrap transaction',
      ERROR_CODE.TRANSACTION_ERROR,
    );
    return {
      stethReceived,
      wstethUnwrapped,
    };
  }
}

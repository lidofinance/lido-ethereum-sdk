import { LidoSDKModule } from '../common/class-primitives/sdk-module.js';
import type { AccountValue, LidoSDKCommonProps } from '../core/types.js';
import { LidoSDKL2Steth, LidoSDKL2Wsteth } from './tokens.js';

import {
  getContract,
  encodeFunctionData,
  decodeEventLog,
  isAddressEqual,
  getAbiItem,
  toEventHash,
  type GetContractReturnType,
  type WalletClient,
  type Address,
  type WriteContractParameters,
  type TransactionReceipt,
} from 'viem';

import {
  CHAINS,
  LIDO_L2_CONTRACT_ADDRESSES,
  LIDO_L2_CONTRACT_NAMES,
  NOOP,
} from '../common/constants.js';
import { Cache, Logger, ErrorHandler } from '../common/decorators/index.js';

import { rebasableL2StethAbi } from './abi/rebasableL2Steth.js';
import { parseValue } from '../common/utils/parse-value.js';
import {
  UnwrapResults,
  WrapInnerProps,
  WrapProps,
  WrapPropsWithoutCallback,
  WrapResults,
} from './types.js';
import { PopulatedTransaction, TransactionResult } from '../core/types.js';
import { invariant, ERROR_CODE } from '../common/index.js';

export class LidoSDKL2 extends LidoSDKModule {
  private static TRANSFER_SIGNATURE = toEventHash(
    getAbiItem({ abi: rebasableL2StethAbi, name: 'Transfer' }),
  );

  public static isContractAvailableOn(
    contract: LIDO_L2_CONTRACT_NAMES,
    chain: CHAINS,
  ) {
    return !!LIDO_L2_CONTRACT_ADDRESSES[chain]?.[contract];
  }

  public readonly wsteth: LidoSDKL2Wsteth;
  public readonly steth: LidoSDKL2Steth;

  constructor(props: LidoSDKCommonProps) {
    super(props);
    this.wsteth = new LidoSDKL2Wsteth({ core: this.core });
    this.steth = new LidoSDKL2Steth({ core: this.core });
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['core.chain.id'])
  public async contractAddress(): Promise<Address> {
    return this.core.getL2ContractAddress(LIDO_L2_CONTRACT_NAMES.steth);
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['core.chain.id'])
  public async getContract(): Promise<
    GetContractReturnType<typeof rebasableL2StethAbi, WalletClient>
  > {
    const address = await this.contractAddress();
    return getContract({
      address,
      abi: rebasableL2StethAbi,
      client: {
        public: this.core.rpcProvider,
        wallet: this.core.web3Provider as WalletClient,
      },
    });
  }

  // Wrap wstETH to stETH

  @Logger('Call:')
  @ErrorHandler()
  public async approveWstethForWrap(
    props: WrapProps,
  ): Promise<TransactionResult> {
    const stethAddress = await this.contractAddress();
    return this.wsteth.approve({
      ...props,
      amount: props.value,
      to: stethAddress,
    });
  }

  @Logger('Utils:')
  @ErrorHandler()
  public async getWstethForWrapAllowance(
    account?: AccountValue,
  ): Promise<bigint> {
    const stethAddress = await this.contractAddress();
    return this.wsteth.allowance({ account, to: stethAddress });
  }

  @Logger('Call:')
  @ErrorHandler()
  public async wrapWstethToSteth(
    props: WrapProps,
  ): Promise<TransactionResult<WrapResults>> {
    this.core.useWeb3Provider();
    const { account, callback, value, ...rest } = await this.parseProps(props);
    const contract = await this.getContract();

    return this.core.performTransaction<WrapResults>({
      ...rest,
      account,
      callback,
      getGasLimit: (options) => contract.estimateGas.wrap([value], options),
      sendTransaction: (options) => contract.write.wrap([value], options),
      decodeResult: (receipt) =>
        this.wrapWstethToStethParseEvents(receipt, account.address),
    });
  }

  @Logger('Utils:')
  public async wrapWstethToStethPopulateTx(
    props: WrapPropsWithoutCallback,
  ): Promise<PopulatedTransaction> {
    const { value, account } = await this.parseProps(props);
    const address = await this.contractAddress();

    return {
      to: address,
      from: account.address,
      data: encodeFunctionData({
        abi: rebasableL2StethAbi,
        functionName: 'wrap',
        args: [value],
      }),
    };
  }

  @Logger('Utils:')
  public async wrapWstethToStethEstimateGas(
    props: WrapPropsWithoutCallback,
  ): Promise<bigint> {
    const { value, account } = await this.parseProps(props);
    const contract = await this.getContract();

    return contract.estimateGas.wrap([value], {
      account,
    });
  }

  @Logger('Utils:')
  private async wrapWstethToStethParseEvents(
    receipt: TransactionReceipt,
    address: Address,
  ): Promise<WrapResults> {
    let stethReceived: bigint | undefined;
    let wstethWrapped: bigint | undefined;
    for (const log of receipt.logs) {
      // skips non-relevant events
      if (log.topics[0] !== LidoSDKL2.TRANSFER_SIGNATURE) continue;
      const parsedLog = decodeEventLog({
        abi: rebasableL2StethAbi,
        strict: true,
        eventName: 'Transfer',
        data: log.data,
        topics: log.topics,
      });
      if (isAddressEqual(parsedLog.args.from, address)) {
        wstethWrapped = parsedLog.args.value;
      } else if (isAddressEqual(parsedLog.args.to, address)) {
        stethReceived = parsedLog.args.value;
      }
    }
    invariant(
      stethReceived,
      'could not find Transfer event in wrap transaction',
      ERROR_CODE.TRANSACTION_ERROR,
    );
    invariant(
      wstethWrapped,
      'could not find Transfer event in wrap transaction',
      ERROR_CODE.TRANSACTION_ERROR,
    );
    return {
      stethReceived,
      wstethWrapped,
    };
  }

  @Logger('Call:')
  @ErrorHandler()
  public async wrapWstethToStethSimulateTx(
    props: WrapPropsWithoutCallback,
  ): Promise<WriteContractParameters> {
    const { value, account } = await this.parseProps(props);
    const contract = await this.getContract();

    const { request } = await contract.simulate.wrap([value], {
      account,
    });

    return request;
  }

  // unwrap stETH to wstETH

  @Logger('Call:')
  @ErrorHandler()
  public async unwrapStethToWsteth(
    props: WrapProps,
  ): Promise<TransactionResult<UnwrapResults>> {
    this.core.useWeb3Provider();
    const { account, callback, value, ...rest } = await this.parseProps(props);
    const contract = await this.getContract();

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
  @ErrorHandler()
  public async unwrapStethPopulateTx(
    props: Omit<WrapProps, 'callback'>,
  ): Promise<PopulatedTransaction> {
    const { value, account } = await this.parseProps(props);
    const to = await this.contractAddress();

    return {
      to,
      from: account.address,
      data: encodeFunctionData({
        abi: rebasableL2StethAbi,
        functionName: 'unwrap',
        args: [value],
      }),
    };
  }

  @Logger('Call:')
  @ErrorHandler()
  public async unwrapStethSimulateTx(
    props: Omit<WrapProps, 'callback'>,
  ): Promise<WriteContractParameters> {
    const { value, account } = await this.parseProps(props);
    const contract = await this.getContract();

    const { request } = await contract.simulate.unwrap([value], {
      account,
    });

    return request;
  }

  @Logger('Utils:')
  @ErrorHandler()
  public async unwrapStethEstimateGas(
    props: Omit<WrapProps, 'callback'>,
  ): Promise<bigint> {
    const { value, account } = await this.parseProps(props);
    const contract = await this.getContract();

    return contract.estimateGas.unwrap([value], {
      account,
    });
  }

  @Logger('Utils:')
  private async unwrapParseEvents(
    receipt: TransactionReceipt,
    address: Address,
  ): Promise<UnwrapResults> {
    let stethUnwrapped: bigint | undefined;
    let wstethReceived: bigint | undefined;
    for (const log of receipt.logs) {
      // skips non-relevant events
      if (log.topics[0] !== LidoSDKL2.TRANSFER_SIGNATURE) continue;
      const parsedLog = decodeEventLog({
        abi: rebasableL2StethAbi,
        strict: true,
        topics: log.topics,
        data: log.data,
        eventName: 'Transfer',
      });
      if (isAddressEqual(parsedLog.args.from, address)) {
        stethUnwrapped = parsedLog.args.value;
      } else if (isAddressEqual(parsedLog.args.to, address)) {
        wstethReceived = parsedLog.args.value;
      }
    }
    invariant(
      stethUnwrapped,
      'could not find Transfer event in unwrap transaction',
      ERROR_CODE.TRANSACTION_ERROR,
    );
    invariant(
      wstethReceived,
      'could not find Transfer event in unwrap transaction',
      ERROR_CODE.TRANSACTION_ERROR,
    );
    return {
      stethUnwrapped,
      wstethReceived,
    };
  }

  // Utils

  @Logger('Utils:')
  private async parseProps(props: WrapProps): Promise<WrapInnerProps> {
    return {
      ...props,
      account: await this.core.useAccount(props.account),
      value: parseValue(props.value),
      callback: props.callback ?? NOOP,
    };
  }
}

import { isAddressEqual, type Address, type Hex } from 'viem';
import { TransactionCallbackStage } from '../core/types.js';
import type {
  LidoSDKCore,
  PopulatedTransaction,
  TransactionOptions,
} from '../core/index.js';
import {
  SDKError,
  ERROR_CODE,
  invariantArgument,
} from '../common/utils/sdk-error.js';
import type {
  EarnDecodedResult,
  EarnReceiptDecoder,
  EarnStep,
  EarnTransactionProps,
} from './types.js';

export class EarnExecutionError extends SDKError {
  /** Keeps the failed operation and submitted hash for recovery. */
  constructor(
    error: unknown,
    public readonly failedStep: EarnStep,
    public readonly submittedHash?: Hex,
  ) {
    super({
      code: ERROR_CODE.TRANSACTION_ERROR,
      message:
        error instanceof Error ? error.message : 'Earn transaction failed',
      error,
    });
    this.cause = error;
  }
}

export class EarnTransaction {
  /** Stores a prepared contract call and its receipt decoder for later execution. */
  constructor(
    private readonly core: LidoSDKCore,
    public readonly step: EarnStep,
    private readonly call: { to: Address; data: Hex; value: bigint },
    private readonly decode: EarnReceiptDecoder = () => ({}),
    private readonly boundAccount?: Address,
  ) {}

  /**
   * Returns a new transaction bound to the account without modifying this instance.
   * Throws if the transaction is already bound to a different account.
   */
  bindAccount(account: Address): EarnTransaction {
    invariantArgument(
      !this.boundAccount || isAddressEqual(this.boundAccount, account),
      'Cannot rebind a prepared Earn transaction',
    );
    return new EarnTransaction(
      this.core,
      this.step,
      this.call,
      this.decode,
      account,
    );
  }

  /** Resolves the caller account and checks that it matches the bound account. */
  private async resolveAccount(props: EarnTransactionProps) {
    const account = await this.core.useAccount(
      props.account ?? (this.core.walletClient ? undefined : this.boundAccount),
    );
    invariantArgument(
      !this.boundAccount || isAddressEqual(this.boundAccount, account.address),
      'Prepared Earn transaction belongs to a different account',
    );
    return account;
  }

  /** Returns call data and sender for external signing, without estimating gas. */
  async populate(
    props: EarnTransactionProps = {},
  ): Promise<PopulatedTransaction> {
    const account = await this.resolveAccount(props);
    return { ...this.call, from: account.address };
  }

  /** Returns the RPC gas estimate unchanged so the caller can apply its own margin. */
  async estimateGas(
    props: EarnTransactionProps = {},
    options?: TransactionOptions,
  ): Promise<bigint> {
    const account = await this.resolveAccount(props);
    return this.core.publicClient.estimateGas({
      ...options,
      ...this.call,
      account,
    });
  }

  /** Runs eth_call without sending a transaction and returns the raw result. */
  async simulate(props: EarnTransactionProps = {}) {
    const account = await this.resolveAccount(props);
    const result = await this.core.publicClient.call({ ...this.call, account });
    return {
      request: { ...this.call, account, chain: this.core.chain },
      result: result.data,
    };
  }

  /** Sends through the SDK transaction flow, decodes receipts, and reports failures. */
  async send(props: EarnTransactionProps = {}) {
    const walletClient = this.core.useWalletClient();
    const account = await this.resolveAccount(props);
    invariantArgument(
      (await walletClient.getChainId()) === this.core.chainId,
      'Wallet and Earn chain do not match',
    );
    let submittedHash: Hex | undefined;
    try {
      await props.onStep?.(this.step);
      return await this.core.performTransaction<EarnDecodedResult>({
        ...props,
        account,
        callback: async (event) => {
          if (event.stage === TransactionCallbackStage.RECEIPT)
            submittedHash = event.payload;
          if (
            event.stage === TransactionCallbackStage.CONFIRMATION &&
            event.payload.status === 'reverted'
          ) {
            throw new SDKError({
              code: ERROR_CODE.TRANSACTION_ERROR,
              message: 'Earn transaction reverted',
            });
          }
          return props.callback?.(event);
        },
        getGasLimit: (options) => this.estimateGas({ account }, options),
        sendTransaction: async (options) => {
          submittedHash = await walletClient.sendTransaction({
            ...options,
            ...this.call,
          });
          return submittedHash;
        },
        decodeResult: async (receipt) => this.decode(receipt, account.address),
      });
    } catch (error) {
      const failure = new EarnExecutionError(error, this.step, submittedHash);
      await props.callback?.({
        stage: TransactionCallbackStage.ERROR,
        payload: failure,
      });
      throw failure;
    }
  }
}

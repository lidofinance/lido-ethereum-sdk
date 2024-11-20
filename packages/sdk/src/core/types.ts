import type {
  WalletClient,
  PublicClient,
  Hash,
  TransactionReceipt,
  Address,
  Chain,
  FormattedTransactionRequest,
  BlockTag,
  Account,
  WaitForTransactionReceiptParameters,
} from 'viem';

import { LIDO_TOKENS, SUPPORTED_CHAINS } from '../common/constants.js';
import { SDKError } from '../common/utils/sdk-error.js';
import type LidoSDKCore from './core.js';

// Constructor Props

export type LOG_MODE = 'info' | 'debug' | 'none';

type LidoSDKCorePropsRpcProps =
  | {
      rpcUrls: string[];
      rpcProvider?: undefined;
    }
  | {
      rpcUrls?: undefined;
      rpcProvider: PublicClient;
    };

export type LidoSDKCoreProps = {
  chainId: (typeof SUPPORTED_CHAINS)[number];
  web3Provider?: WalletClient;
  logMode?: LOG_MODE;
} & LidoSDKCorePropsRpcProps;

export type LidoSDKCommonProps =
  | {
      core: LidoSDKCore;
    }
  | ({ core?: undefined } & LidoSDKCoreProps);

// Method Props primitives

export type EtherValue = string | bigint;

export type AccountValue = Address | Account;

export enum TransactionCallbackStage {
  'PERMIT' = 'permit',
  'GAS_LIMIT' = 'gas_limit',
  'SIGN' = 'sign',
  'RECEIPT' = 'receipt',
  'CONFIRMATION' = 'confirmation',
  'DONE' = 'done',
  'MULTISIG_DONE' = 'multisig_done',
  'ERROR' = 'error',
}

export type CommonTransactionProps = {
  callback?: TransactionCallback;
  account?: AccountValue;
  waitForTransactionReceiptParameters?: WaitForTransactionReceiptParameters;
};

export type PerformTransactionGasLimit = (
  overrides: TransactionOptions,
) => Promise<bigint>;

export type PerformTransactionSendTransaction = (
  override: TransactionOptions,
) => Promise<Hash>;

export type PerformTransactionDecodeResult<TDecodedResult> = (
  receipt: TransactionReceipt,
) => Promise<TDecodedResult>;

type PerformTransactionOptionsDecodePartial<TDecodedResult> =
  TDecodedResult extends undefined
    ? { decodeResult?: undefined }
    : { decodeResult: PerformTransactionDecodeResult<TDecodedResult> };

export type PerformTransactionOptions<TDecodedResult> =
  CommonTransactionProps & {
    getGasLimit: PerformTransactionGasLimit;
    sendTransaction: PerformTransactionSendTransaction;
    waitForTransactionReceiptParameters?: WaitForTransactionReceiptParameters;
  } & PerformTransactionOptionsDecodePartial<TDecodedResult>;

export type TransactionOptions = {
  account: AccountValue;
  chain: Chain;
  gas?: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  nonce?: number;
};

export type TransactionResult<TDecodedResult = undefined> = {
  hash: Hash;
  receipt?: TransactionReceipt;
  confirmations?: bigint;
  result?: TDecodedResult;
};

export type PopulatedTransaction = Omit<FormattedTransactionRequest, 'type'>;

export type NoCallback<TProps extends { callback?: TransactionCallback }> =
  Omit<TProps, 'callback'>;

export type TransactionCallbackProps =
  | { stage: TransactionCallbackStage.PERMIT; payload?: undefined }
  | { stage: TransactionCallbackStage.GAS_LIMIT; payload?: undefined }
  | { stage: TransactionCallbackStage.SIGN; payload?: bigint }
  | { stage: TransactionCallbackStage.RECEIPT; payload: Hash }
  | {
      stage: TransactionCallbackStage.CONFIRMATION;
      payload: TransactionReceipt;
    }
  | { stage: TransactionCallbackStage.DONE; payload: bigint }
  | { stage: TransactionCallbackStage.MULTISIG_DONE; payload?: undefined }
  | { stage: TransactionCallbackStage.ERROR; payload: SDKError };

export type TransactionCallbackResult<TProps> = TProps extends {
  stage: TransactionCallbackStage.SIGN;
}
  ? bigint | undefined
  : void;

export type TransactionCallback = (
  props: TransactionCallbackProps,
) => TransactionCallbackResult<TransactionCallbackProps>;

export type PermitCallbackProps =
  | { stage: TransactionCallbackStage.SIGN; payload?: undefined }
  | { stage: TransactionCallbackStage.DONE; payload?: undefined }
  | { stage: TransactionCallbackStage.ERROR; payload: SDKError };

export type PermitCallback = (props: PermitCallbackProps) => void;

export type PermitSignature = {
  v: number;
  r: `0x${string}`;
  s: `0x${string}`;
  value: bigint;
  deadline: bigint;
  chainId: bigint;
  nonce: bigint;
  owner: Address;
  spender: Address;
};

export type SignPermitProps = {
  token: (typeof LIDO_TOKENS)['steth'] | (typeof LIDO_TOKENS)['wsteth'];
  amount: bigint;
  account?: AccountValue;
  spender: Address;
  deadline?: bigint;
};

export type NonPendingBlockTag = Exclude<BlockTag, 'pending'>;

export type BlockArgumentType =
  | {
      block: bigint | NonPendingBlockTag;
      timestamp?: undefined;
    }
  | {
      block?: undefined;
      timestamp: bigint;
    };

export type BackArgumentType =
  | {
      seconds: bigint;
      days?: undefined;
      blocks?: undefined;
    }
  | {
      seconds?: undefined;
      days: bigint;
      blocks?: undefined;
    }
  | {
      days?: undefined;
      seconds?: undefined;
      blocks: bigint;
    };

// Core methods

export type GetFeeDataResult = {
  lastBaseFeePerGas: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  gasPrice: bigint;
};

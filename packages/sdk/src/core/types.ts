import type {
  WalletClient,
  PublicClient,
  Hash,
  TransactionReceipt,
  Address,
  Chain,
  BlockTag,
  Account,
  WaitForTransactionReceiptParameters,
  GetContractReturnType,
} from 'viem';

import type {
  LIDO_CONTRACT_NAMES,
  LIDO_TOKENS,
  SUPPORTED_CHAINS,
} from '../common/constants.js';
import type { SDKError } from '../common/utils/sdk-error.js';
import type LidoSDKCore from './core.js';
import type { EncodableContract } from '../common/index.js';
import type { LidoLocatorAbiType } from './abi/lidoLocator.js';
import type { LidoAbiType } from './abi/lido.js';

// Constructor Props

export type LOG_MODE = 'info' | 'debug' | 'none';

// Declaration merging similar to wagmi's
// Allows users to augment types and leverage viem types for Lido SDK
export interface ClientRegister {}
export type ResolvedClientRegister = {
  publicClient: ClientRegister extends {
    publicClient: infer ResolvedPublicCLient extends object;
  }
    ? ResolvedPublicCLient
    : PublicClient;

  walletClient: ClientRegister extends {
    walletClient: infer ResolvedWalletClient extends object;
  }
    ? ResolvedWalletClient
    : WalletClient;
};

export type LidoSdkPublicClient = ResolvedClientRegister['publicClient'];
export type LidoSdkWalletClient = ResolvedClientRegister['walletClient'];

export type LidoSdkKeyedClient = {
  public: LidoSdkPublicClient;
  wallet: LidoSdkWalletClient;
};

// Core Props

type LidoSDKCorePropsPublicClientProps =
  | {
      rpcUrls: string[];
      chainId: (typeof SUPPORTED_CHAINS)[number];
      publicClient?: undefined;
      rpcProvider?: undefined;
    }
  | {
      publicClient: LidoSdkPublicClient;
      rpcUrls?: undefined;
      rpcProvider?: undefined;
    }
  | {
      /** @deprecated Use `publicClient` instead. */
      rpcProvider: LidoSdkPublicClient;
      rpcUrls?: undefined;
      publicClient?: undefined;
    };

type LidoSDKCorePropsWalletClientProps =
  | {
      walletClient?: LidoSdkWalletClient;
      web3Provider?: undefined;
    }
  | {
      /** @deprecated Use `walletClient` instead. */
      web3Provider?: LidoSdkWalletClient;
      walletClient?: undefined;
    };

export type ContractAddressManifest = {
  [key in LIDO_CONTRACT_NAMES]?: Address;
};

export type LidoSDKCoreProps = {
  chainId?: (typeof SUPPORTED_CHAINS)[number];
  logMode?: LOG_MODE;
  customLidoLocatorAddress?: Address;
  contractAddressManifest?: ContractAddressManifest;
} & LidoSDKCorePropsPublicClientProps &
  LidoSDKCorePropsWalletClientProps;

export type LidoSDKCommonProps =
  | {
      core: LidoSDKCore;
    }
  | ({ core?: undefined } & LidoSDKCoreProps);

// Contracts
export type LidoLocatorContractType = EncodableContract<
  GetContractReturnType<LidoLocatorAbiType, LidoSdkPublicClient>
>;

export type LidoContractType = EncodableContract<
  GetContractReturnType<LidoAbiType, LidoSdkKeyedClient>
>;

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

export type PopulatedTransaction = {
  to: Address;
  from: Address;
  data?: Hash;
  value?: bigint;
  gas?: bigint;
};

export type NoTxOptions<TProps extends CommonTransactionProps> = Omit<
  TProps,
  'callback' | 'waitForTransactionReceiptParameters'
>;

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

// callback return type based on stage
type TransactionCallbackReturn<TProps> = TProps extends {
  stage: TransactionCallbackStage.SIGN;
}
  ? bigint | undefined
  : void;

// support both async and non async callbacks
export type TransactionCallbackResult<TProps> =
  | TransactionCallbackReturn<TProps>
  | Promise<TransactionCallbackReturn<TProps>>;

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

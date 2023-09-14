import {
  WalletClient,
  PublicClient,
  Hash,
  TransactionReceipt,
  Address,
  Chain,
} from 'viem';

import { LIDO_TOKENS, SUPPORTED_CHAINS } from '../common/constants.js';
import { SDKError } from '../index.js';

export type LOG_MODE = 'info' | 'debug';

type LidoSDKCorePropsRpcUrls = {
  chainId: (typeof SUPPORTED_CHAINS)[number];
  rpcUrls: string[];
  web3Provider?: WalletClient;
  rpcProvider?: undefined;
  logMode?: LOG_MODE;
};
type LidoSDKCorePropsRpcProvider = {
  chainId: (typeof SUPPORTED_CHAINS)[number];
  rpcUrls: undefined;
  web3Provider?: WalletClient;
  rpcProvider: PublicClient;
  logMode?: LOG_MODE;
};

export type LidoSDKCoreProps =
  | LidoSDKCorePropsRpcUrls
  | LidoSDKCorePropsRpcProvider;

export type EtherValue = string | bigint;

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

export type PerformTransactionOptions = {
  callback: TransactionCallback;
  account: Address;
};

export type TransactionOptions = {
  account: Address;
  chain: Chain;
  gas?: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
};

export type TransactionResult = {
  hash: Hash;
  receipt?: TransactionReceipt;
  confirmations?: bigint;
};

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

export type TransactionCallback = (props: TransactionCallbackProps) => void;

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
  nonce: `0x${string}`;
  owner: Address;
  spender: Address;
};

export type SignPermitProps = {
  token: (typeof LIDO_TOKENS)['steth'] | (typeof LIDO_TOKENS)['wsteth'];
  amount: bigint;
  account: Address;
  spender: Address;
  deadline?: bigint;
};

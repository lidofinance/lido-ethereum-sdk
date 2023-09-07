import {
  WalletClient,
  PublicClient,
  Hash,
  TransactionReceipt,
  Address,
} from 'viem';

import { LIDO_CONTRACT_NAMES, SUPPORTED_CHAINS } from '../common/constants.js';
import { SDKError } from '../index.js';

type LidoSDKCorePropsRpcUrls = {
  chainId: (typeof SUPPORTED_CHAINS)[number];
  rpcUrls: string[];
  web3Provider?: WalletClient;
  rpcProvider?: undefined;
};
type LidoSDKCorePropsRpcProvider = {
  chainId: (typeof SUPPORTED_CHAINS)[number];
  rpcUrls: undefined;
  web3Provider?: WalletClient;
  rpcProvider: PublicClient;
};

export type LidoSDKCoreProps =
  | LidoSDKCorePropsRpcUrls
  | LidoSDKCorePropsRpcProvider;

export enum TransactionCallbackStage {
  'SIGN' = 'sign',
  'RECEIPT' = 'receipt',
  'CONFIRMATION' = 'confirmation',
  'DONE' = 'done',
  'MULTISIG_DONE' = 'multisig_done',
  'ERROR' = 'error',
}

export type TransactionCallbackProps =
  | { stage: TransactionCallbackStage.SIGN; payload?: undefined }
  | { stage: TransactionCallbackStage.RECEIPT; payload: Hash }
  | {
      stage: TransactionCallbackStage.CONFIRMATION;
      payload: TransactionReceipt;
    }
  | { stage: TransactionCallbackStage.DONE; payload: bigint }
  | { stage: TransactionCallbackStage.MULTISIG_DONE; payload?: undefined }
  | { stage: TransactionCallbackStage.ERROR; payload: SDKError };

export type TransactionCallback = (props: TransactionCallbackProps) => void;

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
  token: LIDO_CONTRACT_NAMES.lido | LIDO_CONTRACT_NAMES.wsteth;
  amount: bigint;
  account: Address;
  spender: Address;
  deadline?: bigint;
};

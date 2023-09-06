import { WalletClient, PublicClient, Hash, TransactionReceipt } from 'viem';

import { SUPPORTED_CHAINS } from '../common/constants.js';
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

export type TransactionCallbackArgs =
  | { stage: TransactionCallbackStage.SIGN; payload?: undefined }
  | { stage: TransactionCallbackStage.RECEIPT; payload: Hash }
  | {
      stage: TransactionCallbackStage.CONFIRMATION;
      payload: TransactionReceipt;
    }
  | { stage: TransactionCallbackStage.DONE; payload: bigint }
  | { stage: TransactionCallbackStage.MULTISIG_DONE; payload?: undefined }
  | { stage: TransactionCallbackStage.ERROR; payload: SDKError };

export type TransactionCallback = (props: TransactionCallbackArgs) => void;

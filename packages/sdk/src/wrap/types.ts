import { type Address, type Hash, type TransactionReceipt } from 'viem';
import LidoSDKCore from '../core/core.js';
import { LidoSDKCoreProps, TransactionCallback } from '../core/types.js';

export type LidoSDKWrapProps = LidoSDKCoreProps & {
  core?: LidoSDKCore;
};

export type WrapEthProps = {
  value: string;
  account: Address;
  callback?: TransactionCallback;
};

export type WrapResult = {
  hash: Hash;
  receipt?: TransactionReceipt;
  confirmations?: bigint;
};

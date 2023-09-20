import { type Address, type Hash, type TransactionReceipt } from 'viem';
import { type LidoSDKCoreProps, type LidoSDKCore } from '../core/index.js';
import { TransactionCallback } from '../core/types.js';
import { EtherValue } from '../core/types.js';

export type LidoSDKStakeProps = LidoSDKCoreProps & {
  core?: LidoSDKCore;
};

export type StakeProps = {
  value: EtherValue;
  account: Address;
  callback?: TransactionCallback;
  referralAddress?: Address;
};

export type StakeInnerProps = {
  value: bigint;
  account: Address;
  callback: TransactionCallback;
  referralAddress: Address;
};

export type StakeResult = {
  hash: Hash;
  receipt?: TransactionReceipt;
  confirmations?: bigint;
};

export type StakeEncodeDataProps = {
  referralAddress?: Address;
};

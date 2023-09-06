import { type Address, type Hash, type TransactionReceipt } from 'viem';
import { type LidoSDKCoreProps, type LidoSDKCore } from '../core/index.js';
import { TransactionCallback } from '../core/types.js';

export type LidoSDKStakingProps = LidoSDKCoreProps & {
  core?: LidoSDKCore;
};

export type StakeProps = {
  value: string;
  account: Address;
  callback?: TransactionCallback;
  referralAddress?: Address;
};

export type StakeResult = {
  hash: Hash;
  receipt?: TransactionReceipt;
  confirmations?: bigint;
};

export type StakeEncodeDataProps = {
  referralAddress?: Address;
};

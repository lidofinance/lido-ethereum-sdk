import { type Hash, type Address, type ContractFunctionResult } from 'viem';
import LidoSDKCore from '../core/core.js';
import { TransactionCallback, type LidoSDKCoreProps } from '../core/types.js';
import { type unstethAbi } from './abi/unsteth-abi.js';

export type LidoSDKUnstETHProps = {
  core?: LidoSDKCore;
} & LidoSDKCoreProps;

export type UnstethNFTstatus = ContractFunctionResult<
  typeof unstethAbi,
  'getWithdrawalStatus'
>[number];

export type UnstethNFT = { id: bigint } & UnstethNFTstatus;

export type TransactionProps = {
  account: Address;
  callback?: TransactionCallback;
};

export type ParsedProps<TProps extends TransactionProps> = Omit<
  TProps,
  'callback'
> &
  Required<TransactionProps>;

export type NoCallback<TProps extends TransactionProps> = Omit<
  TProps,
  'callback'
>;

export type TransferProps = {
  to: Address;
  id: bigint;
  from?: Address;
  data?: Hash;
} & TransactionProps;

export type ApproveProps = {
  to?: Address;
  id: bigint;
} & TransactionProps;

export type ApproveAllProps = {
  to: Address;
  allow: boolean;
} & TransactionProps;

export type ApprovedForProps = {
  account: Address;
  id: bigint;
};

export type IsApprovedForAllProps = {
  account: Address;
  to: Address;
};

export type SafeTransferFromArguments = readonly [Address, Address, bigint];

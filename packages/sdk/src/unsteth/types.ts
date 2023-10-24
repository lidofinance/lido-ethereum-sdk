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

export type UnstethCommonTransactionProps = {
  account: Address;
  callback?: TransactionCallback;
};

export type ParsedProps<TProps extends UnstethCommonTransactionProps> = Omit<
  TProps,
  'callback'
> &
  Required<UnstethCommonTransactionProps>;

export type NoCallback<TProps extends UnstethCommonTransactionProps> = Omit<
  TProps,
  'callback'
>;

export type UnstethTransferProps = {
  to: Address;
  id: bigint;
  from?: Address;
  data?: Hash;
} & UnstethCommonTransactionProps;

export type UnstethApproveProps = {
  to?: Address;
  id: bigint;
} & UnstethCommonTransactionProps;

export type UnstethApproveAllProps = {
  to: Address;
  allow: boolean;
} & UnstethCommonTransactionProps;

export type UnstethApprovedForProps = {
  account: Address;
  id: bigint;
};

export type UnstethIsApprovedForAllProps = {
  account: Address;
  to: Address;
};

export type SafeTransferFromArguments = readonly [Address, Address, bigint];

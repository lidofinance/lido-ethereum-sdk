import { type Hash, type Address, type ContractFunctionResult } from 'viem';
import { TransactionCallback, CommonTransactionProps } from '../core/types.js';
import { type unstethAbi } from './abi/unsteth-abi.js';

export type UnstethNFTstatus = ContractFunctionResult<
  typeof unstethAbi,
  'getWithdrawalStatus'
>[number];

export type UnstethNFT = { id: bigint } & UnstethNFTstatus;

export type ParsedProps<TProps extends CommonTransactionProps> = Omit<
  TProps,
  'callback'
> & { callback: TransactionCallback };

export type UnstethTransferProps = {
  to: Address;
  id: bigint;
  from?: Address;
  data?: Hash;
} & CommonTransactionProps;

export type UnstethApproveProps = {
  to?: Address;
  id: bigint;
} & CommonTransactionProps;

export type UnstethApproveAllProps = {
  to: Address;
  allow: boolean;
} & CommonTransactionProps;

export type UnstethApprovedForProps = {
  account: Address;
  id: bigint;
};

export type UnstethIsApprovedForAllProps = {
  account: Address;
  to: Address;
};

export type SafeTransferFromArguments = readonly [Address, Address, bigint];

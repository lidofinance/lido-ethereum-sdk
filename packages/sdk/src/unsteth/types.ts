import type {
  Hash,
  Address,
  ContractFunctionReturnType,
  JsonRpcAccount,
} from 'viem';
import type {
  TransactionCallback,
  CommonTransactionProps,
  AccountValue,
} from '../core/types.js';
import type { unstethAbi } from './abi/unsteth-abi.js';

export type UnstethNFTstatus = ContractFunctionReturnType<
  typeof unstethAbi,
  'view',
  'getWithdrawalStatus'
>[number];

export type UnstethNFT = { id: bigint } & UnstethNFTstatus;

export type ParsedProps<TProps extends CommonTransactionProps> = Omit<
  TProps,
  'callback' | 'account'
> & { callback: TransactionCallback; account: JsonRpcAccount };

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
  account?: AccountValue;
  id: bigint;
};

export type UnstethIsApprovedForAllProps = {
  account?: AccountValue;
  to: Address;
};

export type SafeTransferFromArguments = readonly [Address, Address, bigint];

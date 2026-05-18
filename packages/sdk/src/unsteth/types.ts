import type {
  Hash,
  Address,
  ContractFunctionReturnType,
  JsonRpcAccount,
  GetContractReturnType,
} from 'viem';
import type {
  TransactionCallback,
  CommonTransactionProps,
  AccountValue,
  LidoSdkKeyedClient,
} from '../core/types.js';
import type { UnstETHAbiType } from './abi/unsteth-abi.js';
import type { EncodableContract } from '../common/index.js';

export type UnstethContractType = EncodableContract<
  GetContractReturnType<UnstETHAbiType, LidoSdkKeyedClient>
>;

export type UnstethNFTstatus = ContractFunctionReturnType<
  UnstETHAbiType,
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

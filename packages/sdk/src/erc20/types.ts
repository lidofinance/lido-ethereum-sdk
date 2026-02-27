import type { Address, GetContractReturnType, JsonRpcAccount } from 'viem';
import { type EtherValue } from '../core/index.js';
import type {
  AccountValue,
  CommonTransactionProps,
  SignPermitProps,
  LidoSdkKeyedClients,
} from '../core/types.js';
import type { EncodableContract } from '../common/index.js';
import type { erc20abiType } from './abi/erc20abi.js';

export type InnerTransactionProps = Required<CommonTransactionProps>;

export type Erc20ContractType = EncodableContract<
  GetContractReturnType<erc20abiType, LidoSdkKeyedClients>
>;

export type ParsedTransactionProps<TProps extends CommonTransactionProps> =
  Omit<TProps, 'callback' | 'account'> & {
    callback: NonNullable<TProps['callback']>;
    account: JsonRpcAccount;
  } & (TProps extends { amount: EtherValue } ? { amount: bigint } : object);

export type TransferProps = {
  amount: EtherValue;
  to: Address;
  from?: Address;
} & CommonTransactionProps;

export type ApproveProps = {
  amount: EtherValue;
  to: Address;
} & CommonTransactionProps;

export type AllowanceProps = {
  account?: AccountValue;
  to: Address;
};

export type SignTokenPermitProps = Omit<SignPermitProps, 'token'>;

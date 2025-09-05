import type { Address } from 'viem';
import type { Bus } from './bus.js';
import type { CommonTransactionProps } from '../core/types.js';
import { LidoSDKVaultEntity } from './vault-entity.js';

export type CreateVaultProps = CommonTransactionProps & {
  defaultAdmin: Address;
  nodeOperator: Address;
  nodeOperatorManager: Address;
  nodeOperatorFeeBP: bigint;
  confirmExpiry: bigint;
  roleAssignments: Array<{ account: Address; role: `0x${string}` }>;
};

export type CreateVaultResult = {
  vault: LidoSDKVaultEntity;
};

export type FundPros = CommonTransactionProps & {
  value: bigint;
};

export type WithdrawProps = CommonTransactionProps & {
  address: Address;
  amount: bigint;
};

export type FetchVaultsProps = CommonTransactionProps & {
  perPage: number;
  page: number;
};

export type MintSharesProps = CommonTransactionProps & {
  recipient: Address;
  amountOfShares: bigint;
};

export type MintEthProps = CommonTransactionProps & {
  recipient: Address;
  amount: bigint;
};

export type FetchVaultsResult = {
  data: Address[];
  total: number;
};

export type FetchVaultsEntitiesResult = {
  data: LidoSDKVaultEntity[];
  total: number;
};

export type LidoSDKVaultsModuleProps = { bus: Bus; version?: string };

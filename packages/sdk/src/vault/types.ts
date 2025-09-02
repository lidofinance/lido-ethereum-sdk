import type { Address } from 'viem';
import { CommonTransactionProps } from '../core/types.js';

export type CreateVaultProps = CommonTransactionProps & {
  defaultAdmin: Address;
  nodeOperator: Address;
  nodeOperatorManager: Address;
  nodeOperatorFeeBP: bigint;
  confirmExpiry: bigint;
  roleAssignments: Array<{ account: Address; role: `0x${string}` }>;
};

export type CreateVaultResult = {
  vault: Address;
  dashboard: Address;
};

export type FundByVaultPros = CommonTransactionProps & {
  vaultAddress: Address;
  value: bigint;
};

export type FundByDashboardPros = CommonTransactionProps & {
  dashboardAddress: Address;
  value: bigint;
};

export type FetchVaultsProps = CommonTransactionProps & {
  perPage: number;
  page: number;
};

export type FetchVaultsResult = {
  data: Address[];
  total: number;
};

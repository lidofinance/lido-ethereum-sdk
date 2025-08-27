import type { Address } from 'viem';
import { CommonTransactionProps } from '../core/types.js';
import type {
  VAULTS_NO_ROLES_MAP,
  VAULTS_OWNER_ROLES_MAP,
} from './consts/roles.js';

export type PermissionKeys =
  | keyof typeof VAULTS_OWNER_ROLES_MAP
  | keyof typeof VAULTS_NO_ROLES_MAP;

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

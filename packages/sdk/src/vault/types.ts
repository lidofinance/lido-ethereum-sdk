import type { Address, Hex } from 'viem';
import type { Bus } from './bus.js';
import type { CommonTransactionProps } from '../core/types.js';
import { LidoSDKVaultEntity } from './vault-entity.js';

export type LidoSDKVaultsModuleProps = { bus: Bus; version?: string };

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

export type SetRolesProps = CommonTransactionProps & {
  roles: Array<{ account: Address; role: `0x${string}` }>;
};

export type SubmitReportProps = CommonTransactionProps & {
  gateway?: string;
};

// report proof types
export type BigNumberType = 'bigint' | 'string';

export type ExtraDataFields = {
  inOutDelta: string;
  prevFee: string;
  infraFee: string;
  liquidityFee: string;
  reservationFee: string;
};

export type LeafDataFields = {
  vaultAddress: string;
  totalValueWei: string;
  fee: string;
  liabilityShares: string;
  slashingReserve: string;
};

export type Report = {
  format: 'standard-v1';
  leafEncoding: ['address', 'uint256', 'uint256', 'uint256', 'uint256'];
  tree: Hex[];
  values: {
    treeIndex: bigint;
    value: [Address, string, string, string, string];
  }[];
  refSlot: number;
  timestamp: number;
  blockNumber: bigint;
  prevTreeCID: string;
  leafIndexToData: {
    [key: string]: keyof LeafDataFields | number;
  };
  extraValues: {
    [key: string]: ExtraDataFields;
  };
};

export type VaultReport = {
  data: LeafDataFields;
  extraData: ExtraDataFields;
  leaf: string;
  refSlot: number;
  blockNumber: number;
  timestamp: number;
  prevTreeCID: string;
  cid: string;
};

export type VaultReportArgs = {
  vault: Address;
  cid: string;
  gateway?: string;
  bigNumberType?: BigNumberType;
};

export type ReportFetchArgs = {
  cid: string;
  gateway?: string;
  bigNumberType?: BigNumberType;
};

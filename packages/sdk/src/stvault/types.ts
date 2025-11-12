import type { Address, Hash, Hex } from 'viem';
import type { Bus } from './bus.js';
import type { CommonTransactionProps } from '../core/types.js';
import { LidoSDKVaultEntity } from './vault-entity.js';

export type Token = 'steth' | 'wsteth';

export type LidoSDKVaultsModuleProps = { bus: Bus; version?: string };

export type CreateVaultProps = CommonTransactionProps & {
  defaultAdmin: Address;
  nodeOperator: Address;
  nodeOperatorManager: Address;
  nodeOperatorFeeBP: bigint;
  confirmExpirySeconds: bigint;
  roleAssignments: Array<{ account: Address; role: `0x${string}` }>;
  withoutConnectingToVaultHub?: boolean;
};

export type CreateVaultResult = LidoSDKVaultEntity;

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

export type BurnSharesProps = CommonTransactionProps & {
  amountOfShares: bigint;
};

export type MintProps = CommonTransactionProps & {
  recipient: Address;
  amount: bigint;
  token: Token;
};

export type BurnProps = CommonTransactionProps & {
  amount: bigint;
  token: Token;
};

export type PopulateProps = CommonTransactionProps & {
  amount: bigint;
  token: Token;
};

export type FetchVaultsResult = Address[];

export type FetchVaultsEntitiesResult = LidoSDKVaultEntity[];

export type SetRolesProps = CommonTransactionProps & {
  roles: Array<{ account: Address; role: Hash }>;
};

export type SubmitLatestReportProps = CommonTransactionProps & {
  vaultAddress: Address;
  gateway?: string;
  skipIsFresh?: boolean;
};

export type VaultSubmitReportProps = CommonTransactionProps &
  Omit<SubmitLatestReportProps, 'vaultAddress'>;

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
  maxLiabilityShares: string;
  slashingReserve: string;
};

export type Report = {
  format: 'standard-v1';
  leafEncoding: [
    'address',
    'uint256',
    'uint256',
    'uint256',
    'uint256',
    'uint256',
  ];
  tree: Hex[];
  values: {
    treeIndex: bigint;
    value: [Address, string, string, string, string, string];
  }[];
  refSlot: number;
  timestamp: number;
  blockNumber: bigint;
  prevTreeCID: string;
  leafIndexToData: {
    [key: string]: number;
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

export type GetRoleMembersProps = {
  vaultAddress: Address;
  roles: Hash[];
};

export type GetVaultRoleMembersProps = {
  role: Hash;
};

export type GetVaultDataProps = {
  vaultAddress: Address;
};

export type GetRoleMembersBatchProps = {
  vaultAddresses: Address[];
  roles: Hash[];
};

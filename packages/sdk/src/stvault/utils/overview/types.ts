import {
  Address,
  GetContractReturnType,
  Hex,
  ReadContractReturnType,
  WalletClient,
} from 'viem';
import { VaultHubAbi } from '../../abi/index.js';
import { LidoSDKVaultContracts } from '../../vault-contracts.js';
import { lidoPartialAbi } from '../../../core/abi/lidoPartialAbi.js';
import { stETHPartialAbi } from '../../abi/StethPartial.js';
// import type { Confirmation } from '../../utils/get-confirmations';

export type VaultConnection = ReadContractReturnType<
  typeof VaultHubAbi,
  'vaultConnection',
  [Address]
>;

export type VaultRecord = ReadContractReturnType<
  typeof VaultHubAbi,
  'vaultRecord',
  [Address]
>;

export type VaultReportType = {
  vault: Address;
  totalValueWei: bigint;
  fee: bigint;
  liabilityShares: bigint;
  maxLiabilityShares: bigint;
  slashingReserve: bigint;
  proof: Hex[];
  vaultLeafHash: Hex;
};

export type HubReportData = {
  root: Hex;
  refSlot: bigint;
  cid: string;
  timestamp: bigint;
};

export type VaultBaseInfo = {
  blockNumber: bigint;
  address: Address;
  vault: Awaited<ReturnType<LidoSDKVaultContracts['getContractVault']>>;
  hub: Awaited<ReturnType<LidoSDKVaultContracts['getContractVaultHub']>>;
  dashboard: Awaited<
    ReturnType<LidoSDKVaultContracts['getContractVaultDashboard']>
  >;
  operatorGrid: Awaited<
    ReturnType<LidoSDKVaultContracts['getContractOperatorGrid']>
  >;
  lazyOracle: Awaited<
    ReturnType<LidoSDKVaultContracts['getContractLazyOracle']>
  >;

  lidoV3Contract: GetContractReturnType<typeof lidoPartialAbi, WalletClient>;
  stethContract: GetContractReturnType<typeof stETHPartialAbi, WalletClient>;
  nodeOperator: Address;
  vaultOwner: Address;
  withdrawalCredentials: Hex;
  isReportFresh: boolean;
  isReportMissing: boolean;
  hubReport: HubReportData;
  report: VaultReportType | null;
  isVaultDisconnected: boolean; // disconnected by user
  isVaultConnected: boolean;
  isPendingDisconnect: boolean;
  isPendingConnect: boolean;
  isReportAvailable: boolean;
} & VaultConnection;

export type Tier = {
  id: bigint;
  tierName: string;
  shareLimit: bigint;
  shareLimitStETH: bigint;
  liabilityShares: bigint;
  liabilityStETH: bigint;
  operator: Address;
  reserveRatioBP: number;
  forcedRebalanceThresholdBP: number;
  infraFeeBP: number;
  liquidityFeeBP: number;
  reservationFeeBP: number;
};

export type TierVault = {
  tierId: bigint;
  totalValue: bigint;
  shareLimit: bigint;
  stETHLimit: bigint;
  liabilityStETH: bigint;
  mintableStETH: bigint;
  totalMintingCapacityStETH: bigint;
  totalMintingCapacityShares: bigint;
  reserveRatioBP: number;
  forcedRebalanceThresholdBP: number;
  infraFeeBP: number;
  liquidityFeeBP: number;
  reservationFeeBP: number;
  isPendingConnect: boolean;
};

export type VaultTierInfoArgs = {
  vault: VaultBaseInfo;
};

export type VaultTierInfo = {
  lidoTVLSharesLimit: bigint;
  isVaultConnected: boolean;
  address: Address;
  owner: Address;
  nodeOperator: Address;
  vault: TierVault;
  tier: Tier;
  proposals: {
    confirmExpiry: bigint;
    // lastProposal: Confirmation | undefined;
    proposedVaultLimitStETH: bigint;
    proposedVaultLimit: bigint;
  };
};

export type NodeOperatorTierInfoArgs = {
  vault: VaultBaseInfo;
};

export type NodeOperatorTiersInfo = {
  group: {
    nodeOperator: Address;
    shareLimit: bigint;
    stEthLimit: bigint;
    liabilityShares: bigint;
    liabilityStETH: bigint;
  };
  tiers: Tier[];
};

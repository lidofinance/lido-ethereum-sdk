import type { Address, PublicClient } from 'viem';

import { VaultBaseInfo, VaultConnection, VaultRecord } from './types.js';
import { Multicall3AbiUtils } from '../../abi/index.js';
import { MintingConstraintType } from './get-minting-constraint-type.js';

export const VAULT_TOTAL_BASIS_POINTS = 10_000;
type VaultDataArgs = {
  publicClient: PublicClient;
  vault: VaultBaseInfo;
};

type VaultRecordWithoutDelta = Omit<VaultRecord, 'inOutDelta'>;

export type VaultQuarantineState = {
  isActive: boolean;
  pendingTotalValueIncrease: bigint;
  startTimestamp: bigint;
  endTimestamp: bigint;
  totalValueRemainder: bigint;
};

export type VaultInfo = VaultConnection &
  VaultRecordWithoutDelta & {
    address: Address;
    owner: Address;
    nodeOperator: Address;
    totalValue: bigint;
    liabilityShares: bigint;
    liabilityStETH: bigint;
    mintableStETH: bigint;
    mintableShares: bigint;
    stETHLimit: bigint;
    healthScore: number;
    mintingConstraintBy: MintingConstraintType;
    totalMintingCapacityShares: bigint;
    totalMintingCapacityStETH: bigint;
    inOutDelta: bigint;
    redemptionShares: bigint;
    lockedShares: bigint;
    locked: bigint;
    nodeOperatorUnclaimedFee: bigint;
    withdrawableEther: bigint;
    balance: bigint;
    feeRate: number;
    withdrawalCredentials: Address;
    tierId: bigint;
    tierShareLimit: bigint;
    tierStETHLimit: bigint;
    vaultQuarantineState: VaultQuarantineState;
    reportLiabilitySharesStETH: bigint;
    isPendingDisconnect: boolean;
    isVaultDisconnected: boolean;
    isVaultConnected: boolean;
  };

export type VaultOverviewData = ReturnType<typeof selectOverviewData>;

export const getVaultOverviewData = async ({
  publicClient,
  vault,
}: VaultDataArgs): Promise<VaultInfo> => {
  const {
    address,
    dashboard,
    vault: vaultContract,
    nodeOperator,
    withdrawalCredentials,
    forcedRebalanceThresholdBP,
    shareLimit,
    hub,
    operatorGrid,
    report,
    lazyOracle,
    blockNumber,
    lidoV3Contract,
    stethContract,
    ...rest
  } = vault;

  // todo add readWithReport
  const [
    balance,
    totalValue,
    nodeOperatorUnclaimedFee,
    withdrawableEther,
    feeRate,
    totalMintingCapacityShares,
    mintableShares,
    tier,
    group,
    vaultQuarantineState,
  ] = await readWithReport({
    publicClient,
    report,
    contracts: [
      {
        abi: Multicall3AbiUtils,
        address: publicClient.chain?.contracts?.multicall3?.address,
        functionName: 'getEthBalance',
        args: [address],
      },
      dashboard.prepare.totalValue(),
      dashboard.prepare.accruedFee(),
      dashboard.prepare.withdrawableValue(),
      dashboard.prepare.feeRate(),
      dashboard.prepare.totalMintingCapacityShares(),
      dashboard.prepare.remainingMintingCapacityShares([0n]),
      operatorGrid.prepare.vaultTierInfo([vault.address]),
      operatorGrid.prepare.group([vault.nodeOperator]),
      lazyOracle.prepare.vaultQuarantine([vault.address]),
    ] as const,
    blockNumber,
  });

  const [
    obligationsShortfallValue,
    [sharesToBurn, feesToSettle],
    rebalanceShares,
    vaultRecord,
    lockedEth,
    stagedBalanceWei,
    beaconChainDepositsPaused,
  ] = await readWithReport({
    publicClient,
    report,
    contracts: [
      dashboard.prepare.obligationsShortfallValue(),
      dashboard.prepare.obligations(),
      hub.prepare.healthShortfallShares([vault.address]),
      hub.prepare.vaultRecord([vault.address]),
      hub.prepare.locked([vault.address]),
      vaultContract.prepare.stagedBalance(),
      vaultContract.prepare.beaconChainDepositsPaused(),
    ] as const,
    blockNumber,
  });

  const {
    liabilityShares,
    inOutDelta: inOutDeltaArray,
    settledLidoFees,
    cumulativeLidoFees,
    redemptionShares,
    ...restVaultRecord
  } = vaultRecord;

  const inOutDelta = inOutDeltaArray[1].value;
  const [_, tierId, tierShareLimit] = tier;
  const { shareLimit: groupShareLimit } = group;

  const [
    liabilityStETH,
    mintableStETH,
    stETHLimit,
    totalMintingCapacityStETH,
    tierStETHLimit,
    stETHToBurn,
    rebalanceStETH,
    redemptionStETH,
    lidoTVLSharesLimit,
  ] = await Promise.all([
    stethContract.read.getPooledEthBySharesRoundUp([liabilityShares]),
    stethContract.read.getPooledEthByShares([mintableShares]),
    stethContract.read.getPooledEthByShares([shareLimit]),
    stethContract.read.getPooledEthByShares([totalMintingCapacityShares]),
    stethContract.read.getPooledEthByShares([tierShareLimit]),
    stethContract.read.getPooledEthBySharesRoundUp([sharesToBurn]),
    stethContract.read.getPooledEthBySharesRoundUp([rebalanceShares]),
    stethContract.read.getPooledEthBySharesRoundUp([redemptionShares]),
    lidoV3Contract.read.getMaxMintableExternalShares(),
  ]);

  const reportLiabilitySharesStETH = report
    ? await stethContract.read.getPooledEthBySharesRoundUp([
        report.liabilityShares,
      ])
    : 0n;

  return {
    address,
    nodeOperator,
    totalValue,
    liabilityStETH,
    mintableStETH,
    mintableShares,
    stETHLimit,
    totalMintingCapacityShares,
    totalMintingCapacityStETH,
    inOutDelta,
    nodeOperatorUnclaimedFee,
    withdrawableEther,
    balance,
    reportLiabilitySharesStETH,
    feeRate,
    shareLimit,
    forcedRebalanceThresholdBP,
    liabilityShares,
    withdrawalCredentials,
    settledLidoFees,
    cumulativeLidoFees,
    vaultQuarantineState,
    lockedEth,
    tierId,
    tierShareLimit,
    tierStETHLimit,
    lidoTVLSharesLimit,
    groupShareLimit,
    stagedBalanceWei,
    obligationsShortfallValue,
    stETHToBurn,
    feesToSettle,
    rebalanceShares,
    rebalanceStETH,
    redemptionShares,
    redemptionStETH,
    beaconChainDepositsPaused,
    ...rest,
    ...restVaultRecord,
  };
};

import { calculateHealth } from './calculate-health.js';
import { bigIntMax, bigIntMin } from '../../../common/utils/bigint-math.js';

export const modals = [
  'totalValue',
  'healthFactorNumber',
  'netApr',
  'balance',
  'withdrawableEther',
  'undisbursedNodeOperatorFee',
  'unsettledLidoFees',
  'vaultLiability',
] as const;

const customDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: false,
  timeZoneName: 'shortOffset',
});

export const formatCustomDate = (ts: number): string => {
  const ms = Math.abs(ts) < 1e11 ? ts * 1000 : ts;
  return customDateFormatter.format(new Date(ms));
};

type OverviewArgs = {
  totalValue: bigint;
  reserveRatioBP: number;
  liabilitySharesInStethWei: bigint;
  forceRebalanceThresholdBP: number;
  withdrawableEther: bigint;
  balance: bigint;
  locked: bigint;
  nodeOperatorDisbursableFee: bigint;
  totalMintingCapacityStethWei: bigint;
  unsettledLidoFees: bigint;
  minimalReserve: bigint;
  reportLiabilitySharesStETH: bigint;
};

const ceilDiv = (numerator: bigint, denominator: bigint): bigint => {
  const result = numerator / denominator;
  return numerator % denominator === 0n ? result : result + 1n;
};

export const calculateOverviewV2 = (args: OverviewArgs) => {
  const BASIS_POINTS = 10_000n;
  const {
    totalValue,
    reserveRatioBP,
    liabilitySharesInStethWei,
    forceRebalanceThresholdBP,
    withdrawableEther,
    balance,
    locked,
    nodeOperatorDisbursableFee,
    totalMintingCapacityStethWei,
    unsettledLidoFees,
    minimalReserve,
    reportLiabilitySharesStETH,
  } = args;

  const { healthRatio, isHealthy } = calculateHealth({
    totalValue,
    liabilitySharesInStethWei,
    forceRebalanceThresholdBP,
  });
  const availableToWithdrawal = withdrawableEther;
  const idleCapital = balance;
  const totalLocked = locked + nodeOperatorDisbursableFee + unsettledLidoFees;
  const RR = BigInt(reserveRatioBP);
  const oneMinusRR = BASIS_POINTS - RR;
  const collateral = bigIntMax(
    minimalReserve,
    ceilDiv(liabilitySharesInStethWei * BASIS_POINTS, oneMinusRR),
  );
  const recentlyRepaid = bigIntMax(
    0n,
    reportLiabilitySharesStETH - liabilitySharesInStethWei,
  );

  const reservedByFormula =
    oneMinusRR === 0n
      ? 0n
      : ceilDiv(liabilitySharesInStethWei * BASIS_POINTS, oneMinusRR) -
        liabilitySharesInStethWei;
  const reserved = bigIntMin(
    totalValue - liabilitySharesInStethWei,
    reservedByFormula,
  );

  // Prevent division by 0
  const utilizationRatio =
    totalMintingCapacityStethWei === 0n
      ? 0
      : Number(
          ((liabilitySharesInStethWei * BASIS_POINTS) /
            totalMintingCapacityStethWei) *
            100n,
        ) / Number(BASIS_POINTS);

  return {
    healthRatio,
    isHealthy,
    availableToWithdrawal,
    idleCapital,
    totalLocked,
    collateral,
    recentlyRepaid,
    utilizationRatio,
    reserved,
    totalMintingCapacityStethWei,
  };
};

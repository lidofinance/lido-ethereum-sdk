import { VaultReport } from '../../types.js';
import { BASIS_POINTS_DENOMINATOR } from '../../consts/index.js';

const SCALE = 1_000_000_000n; // 1e9 for 9 decimal places precision

export const getGrossStakingRewards = (
  current: VaultReport,
  previous: VaultReport,
) => {
  const grossStakingRewards =
    BigInt(current.data.totalValueWei) -
    BigInt(previous.data.totalValueWei) -
    (BigInt(current.extraData.inOutDelta) -
      BigInt(previous.extraData.inOutDelta));

  return grossStakingRewards;
};

export const getNodeOperatorRewards = (
  current: VaultReport,
  previous: VaultReport,
  nodeOperatorFeeBP: bigint,
) => {
  const grossStakingRewards = getGrossStakingRewards(current, previous);

  return (grossStakingRewards * nodeOperatorFeeBP) / BASIS_POINTS_DENOMINATOR;
};

export const getDailyLidoFees = (
  current: VaultReport,
  previous: VaultReport,
) => {
  return BigInt(current.data.fee) - BigInt(previous.data.fee);
};

export const getNetStakingRewards = (
  current: VaultReport,
  previous: VaultReport,
  nodeOperatorFeeBP: bigint,
) => {
  const grossStakingRewards = getGrossStakingRewards(current, previous);
  const nodeOperatorRewards = getNodeOperatorRewards(
    current,
    previous,
    nodeOperatorFeeBP,
  );
  const dailyLidoFees = getDailyLidoFees(current, previous);

  return grossStakingRewards - nodeOperatorRewards - dailyLidoFees;
};

// The APR metrics (Gross Staking APR, Net Staking APR, Carry Spread) are calculated using the following general formula:
//
// APR = (Numerator * 100 * SecondsInYear) / (AverageTotalValue * PeriodSeconds)
//
// where:
//   Numerator — the specific rewards or value for the metric:
//     - For Gross Staking APR: grossStakingRewards
//     - For Net Staking APR: netStakingRewards
//     - For Carry Spread: bottomLine
//   AverageTotalValue — arithmetic mean of TVL at the start and end of the period
//   PeriodSeconds — difference between end and start timestamps (in seconds)
//   SecondsInYear = 31536000
//
// Calculation steps:
// 1. Calculate the numerator for the metric (see above)
// 2. Divide by the previous TVL
// 3. Multiply by 100 and the number of seconds in a year (31536000)
// 4. Divide by the period duration in seconds
//
// Example for Gross Staking APR:
//   grossStakingAPR = (grossStakingRewards * 100 * 31536000) / (previousTotalValue * periodSeconds)
const getPreviousTotalValue = (previous: VaultReport) => {
  return BigInt(previous.data.totalValueWei);
};

const getPeriodSeconds = (current: VaultReport, previous: VaultReport) => {
  return current.timestamp - previous.timestamp;
};

export const getGrossStakingAPR = (
  current: VaultReport,
  previous: VaultReport,
) => {
  const grossStakingRewards = getGrossStakingRewards(current, previous);
  const previousTotalValue = getPreviousTotalValue(previous);
  const periodSeconds = getPeriodSeconds(current, previous);

  const apr_bigint =
    (grossStakingRewards * 10000n * 31536000n * SCALE) /
    (previousTotalValue * BigInt(periodSeconds));

  const apr =
    (grossStakingRewards * 100n * 31536000n) /
    (previousTotalValue * BigInt(periodSeconds));
  const apr_bps = Number(apr_bigint) / Number(SCALE);
  const apr_percent = apr_bps / 100;

  return {
    apr,
    apr_bps,
    apr_percent,
  };
};

export const getNetStakingAPR = (
  current: VaultReport,
  previous: VaultReport,
  nodeOperatorFeeBP: bigint,
) => {
  const periodSeconds = getPeriodSeconds(current, previous);
  const previousTotalValue = getPreviousTotalValue(previous);
  const netStakingRewards = getNetStakingRewards(
    current,
    previous,
    nodeOperatorFeeBP,
  );

  const apr_bigint =
    (netStakingRewards * 10000n * 31536000n * SCALE) /
    (previousTotalValue * BigInt(periodSeconds));

  const apr =
    (netStakingRewards * 100n * 31536000n) /
    (previousTotalValue * BigInt(periodSeconds));
  const apr_bps = Number(apr_bigint) / Number(SCALE);
  const apr_percent = apr_bps / 100;

  return {
    apr,
    apr_bps,
    apr_percent,
  };
};

export const getBottomLine = (
  current: VaultReport,
  previous: VaultReport,
  nodeOperatorFeeBP: bigint,
  stEthLiabilityRebaseRewards: bigint,
) => {
  const netStakingRewards = getNetStakingRewards(
    current,
    previous,
    nodeOperatorFeeBP,
  );

  return netStakingRewards - stEthLiabilityRebaseRewards;
};

export const getCarrySpread = (
  current: VaultReport,
  previous: VaultReport,
  nodeOperatorFeeBP: bigint,
  stEthLiabilityRebaseRewards: bigint,
) => {
  const previousTotalValue = getPreviousTotalValue(previous);
  const periodSeconds = getPeriodSeconds(current, previous);
  const bottomLine = getBottomLine(
    current,
    previous,
    nodeOperatorFeeBP,
    stEthLiabilityRebaseRewards,
  );

  const apr_bigint =
    (bottomLine * 10000n * 31536000n * SCALE) /
    (previousTotalValue * BigInt(periodSeconds));

  const apr =
    (bottomLine * 100n * 31536000n) /
    (previousTotalValue * BigInt(periodSeconds));
  const apr_bps = Number(apr_bigint) / Number(SCALE);
  const apr_percent = apr_bps / 100;

  return {
    apr,
    apr_bps,
    apr_percent,
  };
};

export type ReportMetricsArgs = {
  reports: { current: VaultReport; previous: VaultReport };
  nodeOperatorFeeRate: bigint;
  stEthLiabilityRebaseRewards: bigint;
};

export const reportMetrics = (args: ReportMetricsArgs) => {
  const { reports, nodeOperatorFeeRate, stEthLiabilityRebaseRewards } = args;
  const { current, previous } = reports;

  const grossStakingRewards = getGrossStakingRewards(current, previous);
  const nodeOperatorRewards = getNodeOperatorRewards(
    current,
    previous,
    nodeOperatorFeeRate,
  );
  const dailyLidoFees = getDailyLidoFees(current, previous);
  const netStakingRewards = getNetStakingRewards(
    current,
    previous,
    nodeOperatorFeeRate,
  );

  const grossStakingAPR = getGrossStakingAPR(current, previous);
  const netStakingAPR = getNetStakingAPR(
    current,
    previous,
    nodeOperatorFeeRate,
  );
  const bottomLine = getBottomLine(
    current,
    previous,
    nodeOperatorFeeRate,
    stEthLiabilityRebaseRewards,
  );
  const carrySpread = getCarrySpread(
    current,
    previous,
    nodeOperatorFeeRate,
    stEthLiabilityRebaseRewards,
  );

  return {
    grossStakingRewards,
    nodeOperatorRewards,
    dailyLidoFees,
    netStakingRewards,
    grossStakingAPR,
    netStakingAPR,
    bottomLine,
    carrySpread,
  };
};

import { BASIS_POINTS_DENOMINATOR } from '../../consts/index.js';

export type CalculateHealthArgs = {
  totalValue: bigint;
  liabilitySharesInStethWei: bigint;
  forceRebalanceThresholdBP: number;
};

export const calculateHealth = (args: CalculateHealthArgs) => {
  const { totalValue, liabilitySharesInStethWei, forceRebalanceThresholdBP } =
    args;
  // Convert everything to BigInt and perform calculations with 1e18 precision
  const PRECISION = 10n ** 18n;

  const thresholdMultiplier =
    ((BASIS_POINTS_DENOMINATOR - BigInt(forceRebalanceThresholdBP)) *
      PRECISION) /
    BASIS_POINTS_DENOMINATOR;
  const adjustedValuation = (totalValue * thresholdMultiplier) / PRECISION;

  const healthRatio18 =
    liabilitySharesInStethWei > 0n
      ? (adjustedValuation * PRECISION * 100n) / liabilitySharesInStethWei
      : Infinity;
  const healthRatio = Number(healthRatio18) / 1e18;

  // Convert to readable format
  const isHealthy = healthRatio >= 100;

  return {
    healthRatio,
    healthRatio18,
    isHealthy,
  };
};

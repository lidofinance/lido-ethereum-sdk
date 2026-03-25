import { describe, test, expect } from 'vitest';
import { calculateHealth } from '../utils/overview/calculate-health.js';

describe('calculateHealth', () => {
  describe('healthy vault', () => {
    test('returns isHealthy=true when totalValue is well above liability', () => {
      const result = calculateHealth({
        totalValue: 100n * 10n ** 18n,
        liabilitySharesInStethWei: 50n * 10n ** 18n,
        forceRebalanceThresholdBP: 1000, // 10%
      });

      expect(result.isHealthy).toBe(true);
      expect(result.healthRatio).toBeGreaterThan(100);
    });

    test('returns isHealthy=true when there is no liability', () => {
      const result = calculateHealth({
        totalValue: 100n * 10n ** 18n,
        liabilitySharesInStethWei: 0n,
        forceRebalanceThresholdBP: 1000,
      });

      expect(result.isHealthy).toBe(true);
      expect(result.healthRatio).toBe(Infinity);
      expect(result.healthRatio18).toBe(Infinity);
    });
  });

  describe('unhealthy vault', () => {
    test('returns isHealthy=false when adjusted value is below liability', () => {
      const result = calculateHealth({
        // totalValue * (1 - 0.5) = 50, but liability = 80 => unhealthy
        totalValue: 100n * 10n ** 18n,
        liabilitySharesInStethWei: 80n * 10n ** 18n,
        forceRebalanceThresholdBP: 5000, // 50%
      });

      expect(result.isHealthy).toBe(false);
      expect(result.healthRatio).toBeLessThan(100);
    });

    test('returns isHealthy=false when totalValue < liabilityShares', () => {
      const result = calculateHealth({
        totalValue: 50n * 10n ** 18n,
        liabilitySharesInStethWei: 100n * 10n ** 18n,
        forceRebalanceThresholdBP: 0,
      });

      expect(result.isHealthy).toBe(false);
    });
  });

  describe('edge cases', () => {
    test('returns exact 100 healthRatio at exact threshold boundary', () => {
      // With threshold=0: adjustedValuation = totalValue * 10000/10000 = totalValue
      // healthRatio = totalValue/liability * 100 = 100 when equal
      const result = calculateHealth({
        totalValue: 100n * 10n ** 18n,
        liabilitySharesInStethWei: 100n * 10n ** 18n,
        forceRebalanceThresholdBP: 0,
      });

      expect(result.healthRatio).toBeCloseTo(100, 0);
      expect(result.isHealthy).toBe(true);
    });

    test('handles zero totalValue with zero liability as Infinity', () => {
      const result = calculateHealth({
        totalValue: 0n,
        liabilitySharesInStethWei: 0n,
        forceRebalanceThresholdBP: 1000,
      });

      expect(result.healthRatio).toBe(Infinity);
      expect(result.isHealthy).toBe(true);
    });

    test('handles zero totalValue with non-zero liability as unhealthy', () => {
      const result = calculateHealth({
        totalValue: 0n,
        liabilitySharesInStethWei: 1n * 10n ** 18n,
        forceRebalanceThresholdBP: 0,
      });

      expect(result.healthRatio).toBe(0);
      expect(result.isHealthy).toBe(false);
    });

    test('healthRatio18 is precision-scaled version of healthRatio', () => {
      const result = calculateHealth({
        totalValue: 200n * 10n ** 18n,
        liabilitySharesInStethWei: 100n * 10n ** 18n,
        forceRebalanceThresholdBP: 0,
      });

      expect(result.healthRatio18).toBeGreaterThan(0n);
      expect(typeof result.healthRatio18).toBe('bigint');
      // healthRatio18 = healthRatio * 1e18
      expect(Number(result.healthRatio18) / 1e18).toBeCloseTo(
        result.healthRatio,
        6,
      );
    });

    test('large forceRebalanceThresholdBP reduces adjusted value', () => {
      // threshold=9000 (90%) means adjustedValuation = totalValue * 10%
      const resultHighThreshold = calculateHealth({
        totalValue: 1000n * 10n ** 18n,
        liabilitySharesInStethWei: 100n * 10n ** 18n,
        forceRebalanceThresholdBP: 9000,
      });

      const resultLowThreshold = calculateHealth({
        totalValue: 1000n * 10n ** 18n,
        liabilitySharesInStethWei: 100n * 10n ** 18n,
        forceRebalanceThresholdBP: 1000,
      });

      expect(resultHighThreshold.healthRatio).toBeLessThan(
        resultLowThreshold.healthRatio,
      );
    });
  });
});

import { describe, test, expect } from 'vitest';
import type { Address } from 'viem';
import { LidoSDKVaultEntity } from '../vault-entity.js';
import type { OverviewArgs } from '../utils/overview/types.js';
import type { Bus } from '../bus.js';

// ─── Minimal mock bus ────────────────────────────────────────────────────────
// calculateOverview and calculateHealth are pure synchronous methods that do
// not access this.bus at all, so a minimal cast is sufficient.
const MOCK_BUS = {} as Bus;
const VAULT_ADDRESS = '0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' as Address;

function makeEntity() {
  return new LidoSDKVaultEntity({
    bus: MOCK_BUS,
    vaultAddress: VAULT_ADDRESS,
  });
}

// ─── Base args factory ───────────────────────────────────────────────────────
function makeArgs(overrides: Partial<OverviewArgs> = {}): OverviewArgs {
  return {
    totalValue: 10_000n * 10n ** 18n, // 10,000 ETH
    reserveRatioBP: 1000, // 10%
    liabilitySharesInStethWei: 1_000n * 10n ** 18n, // 1,000 stETH
    forceRebalanceThresholdBP: 500, // 5%
    withdrawableEther: 500n * 10n ** 18n,
    balance: 200n * 10n ** 18n,
    locked: 100n * 10n ** 18n,
    nodeOperatorDisbursableFee: 10n * 10n ** 18n,
    totalMintingCapacityStethWei: 5_000n * 10n ** 18n,
    unsettledLidoFees: 5n * 10n ** 18n,
    minimalReserve: 50n * 10n ** 18n,
    reportLiabilitySharesStETH: 1_000n * 10n ** 18n,
    ...overrides,
  };
}

describe('LidoSDKVaultEntity.calculateHealth', () => {
  test('returns healthy for vault well above threshold', () => {
    const entity = makeEntity();
    const result = entity.calculateHealth({
      totalValue: 10_000n * 10n ** 18n,
      liabilitySharesInStethWei: 1_000n * 10n ** 18n,
      forceRebalanceThresholdBP: 500,
    });

    expect(result.isHealthy).toBe(true);
    expect(result.healthRatio).toBeGreaterThan(100);
  });

  test('returns unhealthy when liability exceeds adjusted value', () => {
    const entity = makeEntity();
    const result = entity.calculateHealth({
      totalValue: 1_000n * 10n ** 18n,
      liabilitySharesInStethWei: 1_000n * 10n ** 18n,
      forceRebalanceThresholdBP: 500, // 5% threshold reduces value to 950
    });

    // adjustedValue = 1000 * 0.95 = 950, liability = 1000 → 95% < 100%
    expect(result.isHealthy).toBe(false);
    expect(result.healthRatio).toBeLessThan(100);
  });

  test('returns Infinity health ratio when no liability', () => {
    const entity = makeEntity();
    const result = entity.calculateHealth({
      totalValue: 1_000n * 10n ** 18n,
      liabilitySharesInStethWei: 0n,
      forceRebalanceThresholdBP: 500,
    });

    expect(result.isHealthy).toBe(true);
    expect(result.healthRatio).toBe(Infinity);
  });
});

describe('LidoSDKVaultEntity.calculateOverview', () => {
  test('returns expected structure', () => {
    const entity = makeEntity();
    const result = entity.calculateOverview(makeArgs());

    expect(result).toHaveProperty('healthRatio');
    expect(result).toHaveProperty('isHealthy');
    expect(result).toHaveProperty('availableToWithdrawal');
    expect(result).toHaveProperty('idleCapital');
    expect(result).toHaveProperty('totalLocked');
    expect(result).toHaveProperty('collateral');
    expect(result).toHaveProperty('recentlyRepaid');
    expect(result).toHaveProperty('utilizationRatio');
    expect(result).toHaveProperty('reserved');
    expect(result).toHaveProperty('totalMintingCapacityStethWei');
  });

  test('availableToWithdrawal equals withdrawableEther', () => {
    const entity = makeEntity();
    const args = makeArgs({ withdrawableEther: 333n * 10n ** 18n });
    const result = entity.calculateOverview(args);
    expect(result.availableToWithdrawal).toBe(333n * 10n ** 18n);
  });

  test('idleCapital equals balance', () => {
    const entity = makeEntity();
    const args = makeArgs({ balance: 77n * 10n ** 18n });
    const result = entity.calculateOverview(args);
    expect(result.idleCapital).toBe(77n * 10n ** 18n);
  });

  test('totalLocked sums locked + nodeOperatorDisbursableFee + unsettledLidoFees', () => {
    const entity = makeEntity();
    const args = makeArgs({
      locked: 100n,
      nodeOperatorDisbursableFee: 20n,
      unsettledLidoFees: 5n,
    });
    const result = entity.calculateOverview(args);
    expect(result.totalLocked).toBe(125n);
  });

  test('utilizationRatio is zero when totalMintingCapacityStethWei is zero', () => {
    const entity = makeEntity();
    const args = makeArgs({ totalMintingCapacityStethWei: 0n });
    const result = entity.calculateOverview(args);
    expect(result.utilizationRatio).toBe(0);
  });

  test('utilizationRatio reflects actual utilization', () => {
    const entity = makeEntity();
    const args = makeArgs({
      liabilitySharesInStethWei: 2_500n * 10n ** 18n,
      totalMintingCapacityStethWei: 5_000n * 10n ** 18n,
    });
    const result = entity.calculateOverview(args);
    // 2500 / 5000 = 50%
    expect(result.utilizationRatio).toBeCloseTo(50, 0);
  });

  test('recentlyRepaid is zero when no repayment happened', () => {
    const entity = makeEntity();
    const args = makeArgs({
      reportLiabilitySharesStETH: 1_000n * 10n ** 18n,
      liabilitySharesInStethWei: 1_000n * 10n ** 18n, // same → no repayment
    });
    const result = entity.calculateOverview(args);
    expect(result.recentlyRepaid).toBe(0n);
  });

  test('recentlyRepaid reflects repaid amount', () => {
    const entity = makeEntity();
    const args = makeArgs({
      reportLiabilitySharesStETH: 2_000n * 10n ** 18n,
      liabilitySharesInStethWei: 1_500n * 10n ** 18n, // 500 repaid
    });
    const result = entity.calculateOverview(args);
    expect(result.recentlyRepaid).toBe(500n * 10n ** 18n);
  });

  test('isHealthy is true for vault with low liability', () => {
    const entity = makeEntity();
    const result = entity.calculateOverview(
      makeArgs({
        totalValue: 10_000n * 10n ** 18n,
        liabilitySharesInStethWei: 100n * 10n ** 18n,
        forceRebalanceThresholdBP: 500,
      }),
    );
    expect(result.isHealthy).toBe(true);
  });

  test('isHealthy is false when liability exceeds threshold-adjusted totalValue', () => {
    const entity = makeEntity();
    const result = entity.calculateOverview(
      makeArgs({
        totalValue: 1_000n * 10n ** 18n,
        liabilitySharesInStethWei: 1_000n * 10n ** 18n,
        forceRebalanceThresholdBP: 500,
      }),
    );
    expect(result.isHealthy).toBe(false);
  });

  test('collateral uses minimalReserve when it is larger', () => {
    const entity = makeEntity();
    // With very tiny liability, formula would give small collateral
    // but minimalReserve is large
    const largeMinimalReserve = 99_999n * 10n ** 18n;
    const args = makeArgs({
      liabilitySharesInStethWei: 1n,
      minimalReserve: largeMinimalReserve,
      reserveRatioBP: 1000, // 10%
    });
    const result = entity.calculateOverview(args);
    expect(result.collateral).toBe(largeMinimalReserve);
  });
});

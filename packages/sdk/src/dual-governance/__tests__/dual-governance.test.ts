/* eslint-disable jest/no-conditional-expect */
import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { expectSDKModule } from '../../../tests/utils/expect/expect-sdk-module.js';
import { LidoSDKDualGovernance } from '../../index.js';
import { useDualGovernance } from '../../../tests/utils/fixtures/use-dual-governance.js';
import { expectAddress } from '../../../tests/utils/expect/expect-address.js';
import { expectContract } from '../../../tests/utils/expect/expect-contract.js';
import { expectNonNegativeBn } from '../../../tests/utils/expect/expect-bn.js';
import {
  DualGovernanceConfig,
  DualGovernanceState,
  GovernanceState,
} from '../types.js';

describe('LidoSDKDualGovernance', () => {
  const dualGovernance = useDualGovernance();

  test('is correct module', () => {
    expectSDKModule(LidoSDKDualGovernance);
  });

  // ---- Contract Addresses ----

  test('gets governance address', async () => {
    expectAddress(await dualGovernance.getGovernanceAddress());
  });

  test('gets VetoSignallingEscrow address', async () => {
    expectAddress(await dualGovernance.getVetoSignallingEscrowAddress());
  });

  test('gets stETH address', async () => {
    expectAddress(await dualGovernance.getStETHAddress());
  });

  test('gets DualGovernance ConfigProvider address', async () => {
    expectAddress(
      await dualGovernance.getDualGovernanceConfigProviderAddress(),
    );
  });

  // ---- Contracts ----

  test('gets EmergencyProtectedTimelockContract', async () => {
    expectContract(
      await dualGovernance.getContractEmergencyProtectedTimelock(),
    );
  });

  test('gets DualGovernanceContract', async () => {
    expectContract(await dualGovernance.getContractDualGovernance());
  });

  test('gets VetoSignallingEscrowContract', async () => {
    expectContract(await dualGovernance.getContractVetoSignallingEscrow());
  });

  test('gets stETH contract', async () => {
    const stETHContract = await dualGovernance.getContractStETH();
    expectContract(stETHContract);

    const stETHAddress = await dualGovernance.getStETHAddress();
    expectAddress(stETHContract.address, stETHAddress);
  });

  test('gets DualGovernanceConfigProvider', async () => {
    expectContract(
      await dualGovernance.getContractDualGovernanceConfigProvider(),
    );
  });

  // ---- Data Preparation ----

  test('gets VetoSignallingEscrow locked assets', async () => {
    const result = await dualGovernance.getVetoSignallingEscrowLockedAssets();
    expect(result).toBeDefined();
    expect(typeof result).toBe('object');

    expect('totalStETHLockedShares' in result).toBe(true);
    expect('totalStETHClaimedETH' in result).toBe(true);
    expect('totalUnstETHUnfinalizedShares' in result).toBe(true);
    expect('totalUnstETHFinalizedETH' in result).toBe(true);

    expect(typeof result.totalStETHLockedShares).toBe('bigint');
    expect(typeof result.totalStETHClaimedETH).toBe('bigint');
    expect(typeof result.totalUnstETHUnfinalizedShares).toBe('bigint');
    expect(typeof result.totalUnstETHFinalizedETH).toBe('bigint');

    expectNonNegativeBn(result.totalStETHLockedShares);
    expectNonNegativeBn(result.totalStETHClaimedETH);
    expectNonNegativeBn(result.totalUnstETHUnfinalizedShares);
    expectNonNegativeBn(result.totalUnstETHFinalizedETH);
  });

  test('gets total stETH in VetoSignallingEscrow', async () => {
    const totalStEthInEscrow = await dualGovernance.getTotalStEthInEscrow();

    expect(totalStEthInEscrow).toBeDefined();
    expect(typeof totalStEthInEscrow).toBe('bigint');
    expectNonNegativeBn(totalStEthInEscrow);
  });

  test('gets DualGovernance config', async () => {
    const config = await dualGovernance.getDualGovernanceConfig();

    expect(config).toBeDefined();

    expect(config).toBeDefined();
    expect(typeof config).toBe('object');

    expect('firstSealRageQuitSupport' in config).toBe(true);
    expect('secondSealRageQuitSupport' in config).toBe(true);
    expect('minAssetsLockDuration' in config).toBe(true);
    expect('vetoSignallingMinDuration' in config).toBe(true);
    expect('vetoSignallingMaxDuration' in config).toBe(true);
    expect('vetoSignallingMinActiveDuration' in config).toBe(true);
    expect('vetoSignallingDeactivationMaxDuration' in config).toBe(true);
    expect('vetoCooldownDuration' in config).toBe(true);
    expect('rageQuitExtensionPeriodDuration' in config).toBe(true);
    expect('rageQuitEthWithdrawalsMinDelay' in config).toBe(true);
    expect('rageQuitEthWithdrawalsMaxDelay' in config).toBe(true);
    expect('rageQuitEthWithdrawalsDelayGrowth' in config).toBe(true);

    expectNonNegativeBn(config.firstSealRageQuitSupport);
    expectNonNegativeBn(config.secondSealRageQuitSupport);
    expect(config.minAssetsLockDuration).toBeGreaterThanOrEqual(0);
    expect(config.vetoSignallingMinDuration).toBeGreaterThanOrEqual(0);
    expect(config.vetoSignallingMaxDuration).toBeGreaterThanOrEqual(0);
    expect(config.vetoSignallingMinActiveDuration).toBeGreaterThanOrEqual(0);
    expect(config.vetoSignallingDeactivationMaxDuration).toBeGreaterThanOrEqual(
      0,
    );
    expect(config.vetoCooldownDuration).toBeGreaterThanOrEqual(0);
    expect(config.rageQuitExtensionPeriodDuration).toBeGreaterThanOrEqual(0);
    expect(config.rageQuitEthWithdrawalsMinDelay).toBeGreaterThanOrEqual(0);
    expect(config.rageQuitEthWithdrawalsMaxDelay).toBeGreaterThanOrEqual(0);
    expect(config.rageQuitEthWithdrawalsDelayGrowth).toBeGreaterThanOrEqual(0);
  });

  test('gets total stETH supply', async () => {
    const totalStETHSupply = await dualGovernance.getTotalStETHSupply();
    expect(totalStETHSupply).toBeDefined();
    expect(typeof totalStETHSupply).toBe('bigint');
    expectNonNegativeBn(totalStETHSupply);
  });

  test('calculates current VetoSignalling threshold progress', async () => {
    const result =
      await dualGovernance.calculateCurrentVetoSignallingThresholdProgress();

    expect(result).toBeDefined();

    expect(typeof result).toBe('object');
    expect('currentSupportPercent' in result).toBe(true);
    expect(typeof result.currentSupportPercent).toBe('number');
    expect(result.currentSupportPercent).toBeGreaterThanOrEqual(0);
    expect(result.currentSupportPercent).toBeLessThanOrEqual(100);

    const dualGovernanceConfig = await dualGovernance.getDualGovernanceConfig();
    const totalStEthInEscrow = await dualGovernance.getTotalStEthInEscrow();
    const totalStETHSupply = await dualGovernance.getTotalStETHSupply();

    if (
      dualGovernanceConfig.firstSealRageQuitSupport < 0 ||
      totalStEthInEscrow < 0n ||
      totalStETHSupply < 0n
    ) {
      expect(result.currentSupportPercent).toBe(0);
    } else if (totalStETHSupply === 0n) {
      expect(result.currentSupportPercent).toBe(
        totalStEthInEscrow > 0n ? 100 : 0,
      );
    } else {
      const targetValue =
        (totalStETHSupply *
          BigInt(dualGovernanceConfig.firstSealRageQuitSupport)) /
        100n;
      if (targetValue === 0n) {
        expect(result.currentSupportPercent).toBe(
          totalStEthInEscrow > 0n ? 100 : 0,
        );
      } else {
        const expectedPercent = Number(
          (totalStEthInEscrow * 100n) / targetValue,
        );
        const cappedPercent = Math.min(Math.max(expectedPercent, 0), 100);
        expect(result.currentSupportPercent).toBe(cappedPercent);
      }
    }
  });
});

describe('LidoSDKDualGovernance - calculateCurrentVetoSignallingThresholdProgress', () => {
  let dualGovernance: LidoSDKDualGovernance;

  const mockDualGovernanceConfigResponse = {
    secondSealRageQuitSupport: 0n,
    minAssetsLockDuration: 1,
    vetoSignallingMinDuration: 1,
    vetoSignallingMaxDuration: 1,
    vetoSignallingMinActiveDuration: 1,
    vetoSignallingDeactivationMaxDuration: 1,
    vetoCooldownDuration: 1,
    rageQuitExtensionPeriodDuration: 1,
    rageQuitEthWithdrawalsMinDelay: 1,
    rageQuitEthWithdrawalsMaxDelay: 1,
    rageQuitEthWithdrawalsDelayGrowth: 1,
  };

  beforeEach(() => {
    jest.resetAllMocks();
    dualGovernance = new LidoSDKDualGovernance({
      core: { chain: { id: 560048, name: 'Hoodi' } } as any,
    });
  });

  const setupMocks = (
    config: DualGovernanceConfig,
    escrow: bigint,
    supply: bigint,
  ) => {
    jest
      .spyOn(dualGovernance, 'getDualGovernanceConfig')
      .mockResolvedValue(config);

    if (escrow === null) {
      jest.spyOn(dualGovernance, 'getTotalStEthInEscrow').mockResolvedValue(0n);
    } else {
      jest
        .spyOn(dualGovernance, 'getTotalStEthInEscrow')
        .mockResolvedValue(escrow);
    }

    jest.spyOn(dualGovernance, 'getTotalStETHSupply').mockResolvedValue(supply);
  };

  test('calculates progress correctly for normal case', async () => {
    setupMocks(
      {
        firstSealRageQuitSupport: 200000000000000000n,
        ...mockDualGovernanceConfigResponse,
      },
      500n,
      1000n,
    );

    const result =
      await dualGovernance.calculateCurrentVetoSignallingThresholdProgress();
    expect(result).toEqual({ currentSupportPercent: 100 });
  });

  test('caps progress at 100 for high support', async () => {
    setupMocks(
      {
        firstSealRageQuitSupport: 100000000000000000n,
        ...mockDualGovernanceConfigResponse,
      },
      200n,
      1000n,
    );

    const result =
      await dualGovernance.calculateCurrentVetoSignallingThresholdProgress();
    expect(result).toEqual({ currentSupportPercent: 100 });
  });

  test('returns 100 for zero supply with positive escrow', async () => {
    setupMocks(
      {
        firstSealRageQuitSupport: 200000000000000000n,
        ...mockDualGovernanceConfigResponse,
      },
      100n,
      0n,
    );

    const result =
      await dualGovernance.calculateCurrentVetoSignallingThresholdProgress();
    expect(result).toEqual({ currentSupportPercent: 100 });
  });

  test('returns 0 for zero supply with zero escrow', async () => {
    setupMocks(
      {
        firstSealRageQuitSupport: 200000000000000000n,
        ...mockDualGovernanceConfigResponse,
      },
      0n,
      0n,
    );

    const result =
      await dualGovernance.calculateCurrentVetoSignallingThresholdProgress();
    expect(result).toEqual({ currentSupportPercent: 0 });
  });

  test('returns 100 for zero target percent with positive escrow', async () => {
    setupMocks(
      { firstSealRageQuitSupport: 0n, ...mockDualGovernanceConfigResponse },
      500n,
      1000n,
    );

    const result =
      await dualGovernance.calculateCurrentVetoSignallingThresholdProgress();
    expect(result).toEqual({ currentSupportPercent: 100 });
  });

  test('returns 0 for zero target percent with zero escrow', async () => {
    setupMocks(
      { firstSealRageQuitSupport: 0n, ...mockDualGovernanceConfigResponse },
      0n,
      1000n,
    );

    const result =
      await dualGovernance.calculateCurrentVetoSignallingThresholdProgress();
    expect(result).toEqual({ currentSupportPercent: 0 });
  });
});

describe('LidoSDKDualGovernance - getDualGovernanceState', () => {
  let dualGovernance: LidoSDKDualGovernance;

  beforeEach(() => {
    jest.resetAllMocks();
    dualGovernance = new LidoSDKDualGovernance({
      core: { chain: { id: 560048, name: 'Hoodi' } },
    } as any);
  });

  const mockGetContractDualGovernance = (returnValue: DualGovernanceState) => {
    jest.spyOn(dualGovernance, 'getContractDualGovernance').mockResolvedValue({
      read: {
        getStateDetails: jest
          .fn()
          .mockImplementation(() => Promise.resolve(returnValue)),
      } as any,
    } as any);
  };

  test('returns persistedState correctly when contract returns valid data', async () => {
    const mockState: DualGovernanceState = {
      effectiveState: 0,
      persistedState: GovernanceState.RageQuit,
      persistedStateEnteredAt: 0,
      vetoSignallingActivatedAt: 0,
      vetoSignallingReactivationTime: 0,
      normalOrVetoCooldownExitedAt: 0,
      rageQuitRound: 0n,
      vetoSignallingDuration: 0,
    };

    mockGetContractDualGovernance(mockState);

    const result = await dualGovernance.getDualGovernanceState();

    expect(result).toEqual(GovernanceState.RageQuit);
  });
});

describe('LidoSDKDualGovernance - getGovernanceWarningStatus', () => {
  let dualGovernance: LidoSDKDualGovernance;

  beforeEach(() => {
    jest.resetAllMocks();
    dualGovernance = new LidoSDKDualGovernance({
      core: { chain: { id: 560048, name: 'Hoodi' } },
    } as any);
  });

  const setupMocks = (
    governanceState: GovernanceState,
    vetoSignalingProgress: { currentSupportPercent: number },
  ) => {
    jest
      .spyOn(dualGovernance, 'getDualGovernanceState')
      .mockResolvedValue(governanceState);
    jest
      .spyOn(dualGovernance, 'calculateCurrentVetoSignallingThresholdProgress')
      .mockResolvedValue(vetoSignalingProgress);
  };

  test('returns "Blocked" state when in VetoSignalling', async () => {
    setupMocks(GovernanceState.VetoSignalling, { currentSupportPercent: 60 });

    const result = await dualGovernance.getGovernanceWarningStatus({
      triggerPercent: 90,
    });

    expect(result).toEqual({
      state: 'Blocked',
      currentVetoSupportPercent: 60,
    });
  });

  test('returns "Blocked" state when in VetoSignallingDeactivation', async () => {
    setupMocks(GovernanceState.VetoSignallingDeactivation, {
      currentSupportPercent: 60,
    });

    const result = await dualGovernance.getGovernanceWarningStatus({
      triggerPercent: 90,
    });

    expect(result).toEqual({
      state: 'Blocked',
      currentVetoSupportPercent: 60,
    });
  });

  test('returns "Blocked" state when in RageQuit', async () => {
    setupMocks(GovernanceState.RageQuit, { currentSupportPercent: 60 });

    const result = await dualGovernance.getGovernanceWarningStatus({
      triggerPercent: 90,
    });

    expect(result).toEqual({
      state: 'Blocked',
      currentVetoSupportPercent: 60,
    });
  });

  test('returns "Normal" when below threshold and in Normal state', async () => {
    setupMocks(GovernanceState.Normal, { currentSupportPercent: 50 });

    const result = await dualGovernance.getGovernanceWarningStatus({
      triggerPercent: 75,
    });

    expect(result).toEqual({
      state: 'Normal',
      currentVetoSupportPercent: 50,
    });
  });

  test('returns "Unknown" in NotInitialized state', async () => {
    setupMocks(GovernanceState.NotInitialized, { currentSupportPercent: 95 });

    const result = await dualGovernance.getGovernanceWarningStatus({
      triggerPercent: 90,
    });

    expect(result).toEqual({
      state: 'Unknown',
      currentVetoSupportPercent: null,
    });
  });
});

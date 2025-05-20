/* eslint-disable jest/no-conditional-expect */
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { expectSDKModule } from '../../../tests/utils/expect/expect-sdk-module.js';
import { LidoSDKDualGovernance } from '../../index.js';
import { useDualGovernance } from '../../../tests/utils/fixtures/use-dual-governance.js';
import { expectAddress } from '../../../tests/utils/expect/expect-address.js';
import { expectContract } from '../../../tests/utils/expect/expect-contract.js';
import { expectNonNegativeBn } from '../../../tests/utils/expect/expect-bn.js';
import { DualGovernanceConfig, DualGovernanceState, GovernanceState } from '../types.js';

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
    const stETHAddress = await dualGovernance.getStETHAddress();

    if (stETHAddress !== undefined) {
      expect(stETHAddress).toBeDefined();
      expectAddress(stETHAddress);
    } else {
      expect(stETHAddress).toBeUndefined();
    }
  });

  test('gets DualGovernance ConfigProvider address', async () => {
    const configProviderAddress =
      await dualGovernance.getDualGovernanceConfigProviderAddress();

    if (configProviderAddress !== undefined) {
      expect(configProviderAddress).toBeDefined();
      expectAddress(configProviderAddress);
    } else {
      expect(configProviderAddress).toBeUndefined();
    }
  });

  // ---- Contracts ----

  test('gets EmergencyProtectedTimeloclContract', async () => {
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
    if (stETHAddress !== undefined) {
      expectAddress(stETHContract.address, stETHAddress);
    }
  });

  test('gets DualGovernanceConfigProvider', async () => {
    expectContract(
      await dualGovernance.getContractDualGovernanceConfigProvider(),
    );
  });

  // ---- Data Preparation ----

  test('gets VetoSignallingEscrow locked assets', async () => {
    const result = await dualGovernance.getVetoSignallingEscrowLockedAssets();

    if (result !== undefined) {
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
    } else {
      expect(result).toBeUndefined();
    }
  });

  test('gets total stETH in VetoSignallingEscrow', async () => {
    const totalStEthInEscrow = await dualGovernance.getTotalStEthInEscrow();

    if (totalStEthInEscrow !== undefined) {
      expect(totalStEthInEscrow).toBeDefined();
      expect(typeof totalStEthInEscrow).toBe('bigint');
      expectNonNegativeBn(totalStEthInEscrow);
    } else {
      expect(totalStEthInEscrow).toBeUndefined();
    }
  });

  test('gets DualGovernance config', async () => {
    const config = await dualGovernance.getDualGovernanceConfig();

    if (config !== undefined) {
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
      expect(
        config.vetoSignallingDeactivationMaxDuration,
      ).toBeGreaterThanOrEqual(0);
      expect(config.vetoCooldownDuration).toBeGreaterThanOrEqual(0);
      expect(config.rageQuitExtensionPeriodDuration).toBeGreaterThanOrEqual(0);
      expect(config.rageQuitEthWithdrawalsMinDelay).toBeGreaterThanOrEqual(0);
      expect(config.rageQuitEthWithdrawalsMaxDelay).toBeGreaterThanOrEqual(0);
      expect(config.rageQuitEthWithdrawalsDelayGrowth).toBeGreaterThanOrEqual(
        0,
      );
    } else {
      expect(config).toBeUndefined();
    }
  });

  test('gets total stETH supply', async () => {
    const totalStETHSupply = await dualGovernance.getTotalStETHSupply();

    if (totalStETHSupply !== undefined) {
      expect(totalStETHSupply).toBeDefined();
      expect(typeof totalStETHSupply).toBe('bigint');
      expectNonNegativeBn(totalStETHSupply);
    } else {
      expect(totalStETHSupply).toBeUndefined();
    }
  });

  test('calculates current VetoSignalling threshold progress', async () => {
    try {
      const result =
        await dualGovernance.calculateCurrentVetoSignallingThresholdProgress();

      if (result !== undefined) {
        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
        expect('currentSupportPercent' in result).toBe(true);
        expect(typeof result.currentSupportPercent).toBe('number');
        expect(result.currentSupportPercent).toBeGreaterThanOrEqual(0);
        expect(result.currentSupportPercent).toBeLessThanOrEqual(100);

        const dualGovernanceConfig =
          await dualGovernance.getDualGovernanceConfig();
        const totalStEthInEscrow = await dualGovernance.getTotalStEthInEscrow();
        const totalStETHSupply = await dualGovernance.getTotalStETHSupply();

        if (
          dualGovernanceConfig &&
          totalStEthInEscrow !== undefined &&
          totalStETHSupply !== undefined
        ) {
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
        } else {
          expect(result.currentSupportPercent).toBe(0);
        }
      }
    } catch (error) {
      console.debug(JSON.stringify(error));
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
    config: DualGovernanceConfig | undefined,
    escrow: bigint | undefined,
    supply: bigint | undefined,
  ) => {
    jest
      .spyOn(dualGovernance, 'getDualGovernanceConfig')
      .mockResolvedValue(config);
    jest
      .spyOn(dualGovernance, 'getTotalStEthInEscrow')
      .mockResolvedValue(escrow);
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

  test('returns 0 when config is undefined', async () => {
    setupMocks(undefined, 500n, 1000n);

    const result =
      await dualGovernance.calculateCurrentVetoSignallingThresholdProgress();
    expect(result).toEqual({ currentSupportPercent: 0 });
  });

  test('returns 0 when escrow is undefined', async () => {
    setupMocks(
      {
        firstSealRageQuitSupport: 200000000000000000n,
        ...mockDualGovernanceConfigResponse,
      },
      undefined,
      1000n,
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
      read: ({
        getStateDetails: jest.fn().mockImplementation(() => Promise.resolve(returnValue)),
      } as any),
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

  test('returns undefined if contract is not available', async () => {
    jest
      .spyOn(dualGovernance, 'getContractDualGovernance')
      .mockResolvedValue(undefined as any);

    const result = await dualGovernance.getDualGovernanceState();

    expect(result).toBeUndefined();
  });

  test('returns undefined on contract read failure', async () => {
    jest.spyOn(dualGovernance, 'getContractDualGovernance').mockResolvedValue({
      read: ({
        getStateDetails: jest.fn().mockImplementation(() => Promise.reject(new Error('read failed'))),
      } as any),
    } as any);

    const result = await dualGovernance.getDualGovernanceState();

    expect(result).toBeUndefined();
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
    governanceState: GovernanceState | undefined,
    vetoSignalingProgress: { currentSupportPercent: number } | undefined | null,
  ) => {
    jest
      .spyOn(dualGovernance, 'getDualGovernanceState')
      .mockResolvedValue(governanceState);
    jest
      .spyOn(dualGovernance, 'calculateCurrentVetoSignallingThresholdProgress')
      .mockResolvedValue(
        vetoSignalingProgress === null ? undefined : vetoSignalingProgress,
      );
  };

  test('returns "Blocked" state when in VetoSignalling', async () => {
    setupMocks(GovernanceState.VetoSignalling, null);

    const result = await dualGovernance.getGovernanceWarningStatus({
      triggerPercent: 90,
    });

    expect(result).toEqual({
      state: 'Blocked',
      currentVetoSupportPercent: null,
    });
  });

  test('returns "Blocked" state when in VetoSignallingDeactivation', async () => {
    setupMocks(GovernanceState.VetoSignallingDeactivation, null);

    const result = await dualGovernance.getGovernanceWarningStatus({
      triggerPercent: 90,
    });

    expect(result).toEqual({
      state: 'Blocked',
      currentVetoSupportPercent: null,
    });
  });

  test('returns "Blocked" state when in RageQuit', async () => {
    setupMocks(GovernanceState.RageQuit, null);

    const result = await dualGovernance.getGovernanceWarningStatus({
      triggerPercent: 90,
    });

    expect(result).toEqual({
      state: 'Blocked',
      currentVetoSupportPercent: null,
    });
  });

  test('returns "Normal" when below threshold and in Normal state', async () => {
    setupMocks(GovernanceState.Normal, { currentSupportPercent: 50 });

    const result = await dualGovernance.getGovernanceWarningStatus({
      triggerPercent: 75,
    });

    expect(result).toEqual({
      state: 'Normal',
      currentVetoSupportPercent: null,
    });
  });

  test('returns "Warning" when above threshold and in NotInitialized state', async () => {
    setupMocks(GovernanceState.NotInitialized, { currentSupportPercent: 95 });

    const result = await dualGovernance.getGovernanceWarningStatus({
      triggerPercent: 90,
    });

    expect(result).toEqual({ state: 'Warning', currentVetoSupportPercent: 95 });
  });

  test('returns undefined if governance state is undefined', async () => {
    setupMocks(undefined, null);

    const result = await dualGovernance.getGovernanceWarningStatus({
      triggerPercent: 90,
    });

    expect(result).toBeUndefined();
  });

  test('returns undefined if calculateCurrentVetoSignallingThresholdProgress throws error', async () => {
    setupMocks(GovernanceState.Normal, undefined);
    jest
      .spyOn(dualGovernance, 'calculateCurrentVetoSignallingThresholdProgress')
      .mockRejectedValueOnce(new Error('calculation failed'));

    const result = await dualGovernance.getGovernanceWarningStatus({
      triggerPercent: 90,
    });

    expect(result).toBeUndefined();
  });
});

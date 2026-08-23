import { describe, test, expect, vi } from 'vitest';
import { isAddressEqual, zeroAddress, type Address } from 'viem';
import { LidoSDKVaultEntity } from '../vault-entity.js';
import type { OverviewArgs } from '../utils/overview/types.js';
import type { Bus } from '../bus.js';
import { PROXY_CODE_PAD_LEFT, PROXY_CODE_PAD_RIGHT } from '../consts/index.js';
import { ERROR_CODE, SDKError } from '../../common/utils/sdk-error.js';

// ─── Minimal mock bus ────────────────────────────────────────────────────────
// calculateOverview and calculateHealth are pure synchronous methods that do
// not access this.bus at all, so a minimal cast is sufficient.
const MOCK_BUS = {} as Bus;
const VAULT_ADDRESS = '0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' as Address;

const makeEntity = () =>
  new LidoSDKVaultEntity({
    bus: MOCK_BUS,
    vaultAddress: VAULT_ADDRESS,
  });

// ─── Base args factory ───────────────────────────────────────────────────────
const makeArgs = (overrides: Partial<OverviewArgs> = {}): OverviewArgs => ({
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
});

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

// ─── Dashboard resolution ────────────────────────────────────────────────────
// getDashboardAddress does touch this.bus, so these tests need a stub bus
// exposing the contracts and the publicClient.getCode it reads.

const HUB_ADDRESS = '0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB' as Address;
const DASHBOARD_ADDRESS = '0xCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC' as Address;
const PENDING_DASHBOARD = '0xDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD' as Address;
const EOA_ADDRESS = '0xEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE' as Address;
const DASHBOARD_IMPL = '0x1111111111111111111111111111111111111111' as Address;

const DASHBOARD_PROXY_CODE =
  PROXY_CODE_PAD_LEFT +
  DASHBOARD_IMPL.slice(2).toLowerCase() +
  PROXY_CODE_PAD_RIGHT;

type StubOptions = {
  isVaultConnected: boolean;
  vaultOwner: Address;
  vaultConnectionOwner?: Address;
  pendingOwner?: Address;
  /** addresses whose deployed bytecode is the Dashboard clone proxy */
  dashboards?: Address[];
  skipDashboardCheck?: boolean;
};

const makeDashboardEntity = (opts: StubOptions) => {
  const dashboards = opts.dashboards ?? [];

  const getCode = vi.fn(
    async ({
      address,
      blockNumber,
    }: {
      address: Address;
      blockNumber?: bigint;
    }) => {
      void blockNumber;
      return dashboards.some((d) => isAddressEqual(d, address))
        ? DASHBOARD_PROXY_CODE
        : '0xdeadbeef';
    },
  );

  const owner = vi.fn(async (_options?: { blockNumber?: bigint }) => {
    return opts.vaultOwner;
  });
  const pendingOwner = vi.fn(async (_options?: { blockNumber?: bigint }) => {
    return opts.pendingOwner ?? zeroAddress;
  });
  const isVaultConnected = vi.fn(
    async (_args: [Address], _options?: { blockNumber?: bigint }) => {
      return opts.isVaultConnected;
    },
  );
  const vaultConnection = vi.fn(
    async (_args: [Address], _options?: { blockNumber?: bigint }) => {
      return { owner: opts.vaultConnectionOwner ?? zeroAddress };
    },
  );
  const dashboardImpl = vi.fn(async () => DASHBOARD_IMPL);
  const getContractVaultDashboard = vi.fn(async (address: Address) => ({
    address,
  }));

  const bus = {
    core: {
      logMode: 'none',
      chain: { id: 1 },
      publicClient: { getCode },
      error: (props: { code: ERROR_CODE; message: string }) =>
        new SDKError(props),
    },
    contracts: {
      getContractVaultHub: async () => ({
        address: HUB_ADDRESS,
        read: { isVaultConnected, vaultConnection },
      }),
      getContractVault: async () => ({ read: { owner, pendingOwner } }),
      getContractVaultFactory: async () => ({
        read: { DASHBOARD_IMPL: dashboardImpl },
      }),
      getContractVaultDashboard,
    },
  } as unknown as Bus;

  const entity = new LidoSDKVaultEntity({
    bus,
    vaultAddress: VAULT_ADDRESS,
    skipDashboardCheck: opts.skipDashboardCheck ?? true,
  });

  return {
    entity,
    mocks: {
      getCode,
      owner,
      pendingOwner,
      isVaultConnected,
      vaultConnection,
      dashboardImpl,
      getContractVaultDashboard,
    },
  };
};

describe('LidoSDKVaultEntity.getDashboardAddress', () => {
  test('returns the vault owner when it is a Dashboard', async () => {
    const { entity, mocks } = makeDashboardEntity({
      isVaultConnected: true,
      vaultOwner: DASHBOARD_ADDRESS,
      dashboards: [DASHBOARD_ADDRESS],
    });

    await expect(entity.getDashboardAddress()).resolves.toBe(DASHBOARD_ADDRESS);
    // the pending-owner fallback must not cost an extra read on the happy path
    expect(mocks.pendingOwner).not.toHaveBeenCalled();
  });

  test('vaultConnection.owner wins over the vault owner', async () => {
    const { entity } = makeDashboardEntity({
      isVaultConnected: true,
      vaultConnectionOwner: DASHBOARD_ADDRESS,
      vaultOwner: EOA_ADDRESS,
      dashboards: [DASHBOARD_ADDRESS],
    });

    await expect(entity.getDashboardAddress()).resolves.toBe(DASHBOARD_ADDRESS);
  });

  test('falls back to the pending owner when the VaultHub holds the vault', async () => {
    // the state after voluntaryDisconnect() but before acceptOwnership()
    const { entity, mocks } = makeDashboardEntity({
      isVaultConnected: false,
      vaultOwner: HUB_ADDRESS,
      pendingOwner: PENDING_DASHBOARD,
      dashboards: [PENDING_DASHBOARD],
    });

    await expect(entity.getDashboardAddress()).resolves.toBe(
      PENDING_DASHBOARD,
    );
    expect(mocks.pendingOwner).toHaveBeenCalledTimes(1);
  });

  test('does not use the pending owner when it is not a Dashboard', async () => {
    const { entity } = makeDashboardEntity({
      isVaultConnected: false,
      vaultOwner: HUB_ADDRESS,
      pendingOwner: EOA_ADDRESS,
      dashboards: [],
    });

    await expect(entity.getDashboardAddress()).resolves.toBe(HUB_ADDRESS);
  });

  test('does not read the pending owner when the vault is still connected', async () => {
    const { entity, mocks } = makeDashboardEntity({
      isVaultConnected: true,
      vaultOwner: HUB_ADDRESS,
      pendingOwner: PENDING_DASHBOARD,
      dashboards: [PENDING_DASHBOARD],
      skipDashboardCheck: true,
    });

    await expect(entity.getDashboardAddress()).resolves.toBe(HUB_ADDRESS);
    expect(mocks.pendingOwner).not.toHaveBeenCalled();
  });

  test('falls through with a zero pending owner and skipDashboardCheck', async () => {
    const { entity } = makeDashboardEntity({
      isVaultConnected: false,
      vaultOwner: HUB_ADDRESS,
      pendingOwner: zeroAddress,
      dashboards: [],
    });

    await expect(entity.getDashboardAddress()).resolves.toBe(HUB_ADDRESS);
  });

  test('throws NOT_SUPPORTED when connected to a non-Dashboard owner', async () => {
    const { entity } = makeDashboardEntity({
      isVaultConnected: true,
      vaultOwner: EOA_ADDRESS,
      dashboards: [],
      skipDashboardCheck: false,
    });

    await expect(entity.getDashboardAddress()).rejects.toMatchObject({
      code: ERROR_CODE.NOT_SUPPORTED,
    });
  });

  test('forwards blockNumber to getCode and to the hub/vault reads', async () => {
    const blockNumber = 21_000_000n;
    const { entity, mocks } = makeDashboardEntity({
      isVaultConnected: false,
      vaultOwner: HUB_ADDRESS,
      pendingOwner: PENDING_DASHBOARD,
      dashboards: [PENDING_DASHBOARD],
    });

    await entity.getDashboardAddress({ blockNumber });

    expect(mocks.isVaultConnected).toHaveBeenCalledWith([VAULT_ADDRESS], {
      blockNumber,
    });
    expect(mocks.vaultConnection).toHaveBeenCalledWith([VAULT_ADDRESS], {
      blockNumber,
    });
    expect(mocks.owner).toHaveBeenCalledWith({ blockNumber });
    expect(mocks.pendingOwner).toHaveBeenCalledWith({ blockNumber });
    for (const call of mocks.getCode.mock.calls) {
      expect(call[0]).toMatchObject({ blockNumber });
    }
  });

  test('memoizes the resolved address across calls', async () => {
    const { entity, mocks } = makeDashboardEntity({
      isVaultConnected: false,
      vaultOwner: HUB_ADDRESS,
      pendingOwner: PENDING_DASHBOARD,
      dashboards: [PENDING_DASHBOARD],
    });

    await entity.getDashboardAddress();
    await entity.getDashboardAddress();

    expect(mocks.pendingOwner).toHaveBeenCalledTimes(1);
  });

  test('an explicitly supplied dashboardAddress short-circuits all reads', async () => {
    // an empty contracts stub proves no read is attempted
    const bus = {
      core: { logMode: 'none', chain: { id: 1 } },
      contracts: {},
    } as unknown as Bus;
    const entity = new LidoSDKVaultEntity({
      bus,
      vaultAddress: VAULT_ADDRESS,
      dashboardAddress: DASHBOARD_ADDRESS,
    });

    await expect(entity.getDashboardAddress()).resolves.toBe(DASHBOARD_ADDRESS);
  });
});

describe('LidoSDKVaultEntity.isDashboard', () => {
  test('true for the Dashboard clone proxy bytecode', async () => {
    const { entity } = makeDashboardEntity({
      isVaultConnected: true,
      vaultOwner: DASHBOARD_ADDRESS,
      dashboards: [DASHBOARD_ADDRESS],
    });

    await expect(entity.isDashboard(DASHBOARD_ADDRESS)).resolves.toBe(true);
    await expect(entity.isDashboard(EOA_ADDRESS)).resolves.toBe(false);
  });

  test('caches the proxy code across calls', async () => {
    const { entity, mocks } = makeDashboardEntity({
      isVaultConnected: true,
      vaultOwner: DASHBOARD_ADDRESS,
      dashboards: [DASHBOARD_ADDRESS],
    });

    await entity.isDashboard(DASHBOARD_ADDRESS);
    await entity.isDashboard(DASHBOARD_ADDRESS);

    // one getCode per call, but the factory's DASHBOARD_IMPL is read once
    expect(mocks.getCode).toHaveBeenCalledTimes(2);
    expect(mocks.dashboardImpl).toHaveBeenCalledTimes(1);
  });
});

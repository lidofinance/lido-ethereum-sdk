import { describe, test, expect } from 'vitest';
import {
  decodeFunctionResult,
  encodeAbiParameters,
  getAddress,
  type Address,
} from 'viem';

import { VaultViewerAbi } from '../../index.js';

// Reference `VaultViewer.VaultData` ABI type, written independently of the
// vendored `VaultViewerAbi` so this test fails if the vendored ABI drifts
// (e.g. the `accruedFee` field is dropped or reordered).
const VAULT_DATA_COMPONENTS = [
  { type: 'address', name: 'vaultAddress' },
  {
    type: 'tuple',
    name: 'connection',
    components: [
      { type: 'address', name: 'owner' },
      { type: 'uint96', name: 'shareLimit' },
      { type: 'uint96', name: 'vaultIndex' },
      { type: 'uint48', name: 'disconnectInitiatedTs' },
      { type: 'uint16', name: 'reserveRatioBP' },
      { type: 'uint16', name: 'forcedRebalanceThresholdBP' },
      { type: 'uint16', name: 'infraFeeBP' },
      { type: 'uint16', name: 'liquidityFeeBP' },
      { type: 'uint16', name: 'reservationFeeBP' },
      { type: 'bool', name: 'beaconChainDepositsPauseIntent' },
    ],
  },
  {
    type: 'tuple',
    name: 'record',
    components: [
      {
        type: 'tuple',
        name: 'report',
        components: [
          { type: 'uint104', name: 'totalValue' },
          { type: 'int104', name: 'inOutDelta' },
          { type: 'uint48', name: 'timestamp' },
        ],
      },
      { type: 'uint96', name: 'maxLiabilityShares' },
      { type: 'uint96', name: 'liabilityShares' },
      {
        type: 'tuple[2]',
        name: 'inOutDelta',
        components: [
          { type: 'int104', name: 'value' },
          { type: 'int104', name: 'valueOnRefSlot' },
          { type: 'uint48', name: 'refSlot' },
        ],
      },
      { type: 'uint128', name: 'minimalReserve' },
      { type: 'uint128', name: 'redemptionShares' },
      { type: 'uint128', name: 'cumulativeLidoFees' },
      { type: 'uint128', name: 'settledLidoFees' },
    ],
  },
  { type: 'uint256', name: 'totalValue' },
  { type: 'uint256', name: 'liabilityStETH' },
  { type: 'uint256', name: 'nodeOperatorFeeRate' },
  { type: 'uint256', name: 'accruedFee' },
  { type: 'bool', name: 'isReportFresh' },
  {
    type: 'tuple',
    name: 'quarantineInfo',
    components: [
      { type: 'bool', name: 'isActive' },
      { type: 'uint256', name: 'pendingTotalValueIncrease' },
      { type: 'uint256', name: 'startTimestamp' },
      { type: 'uint256', name: 'endTimestamp' },
      { type: 'uint256', name: 'totalValueRemainder' },
    ],
  },
] as const;

const VAULT_DATA_REF = {
  type: 'tuple',
  components: VAULT_DATA_COMPONENTS,
} as const;

const VAULT_DATA_ARRAY_REF = {
  type: 'tuple[]',
  components: VAULT_DATA_COMPONENTS,
} as const;

type VaultDataOverrides = {
  vaultAddress?: Address;
  totalValue?: bigint;
  liabilityStETH?: bigint;
  accruedFee?: bigint;
  isReportFresh?: boolean;
};

const makeVaultData = (overrides: VaultDataOverrides = {}) => ({
  vaultAddress: '0x1111111111111111111111111111111111111111' as Address,
  connection: {
    owner: '0x2222222222222222222222222222222222222222' as Address,
    shareLimit: 1000n,
    vaultIndex: 1n,
    disconnectInitiatedTs: 0,
    reserveRatioBP: 1000,
    forcedRebalanceThresholdBP: 500,
    infraFeeBP: 100,
    liquidityFeeBP: 200,
    reservationFeeBP: 300,
    beaconChainDepositsPauseIntent: false,
  },
  record: {
    report: {
      totalValue: 1000n,
      inOutDelta: 0n,
      timestamp: 1700000000,
    },
    maxLiabilityShares: 1000n,
    liabilityShares: 500n,
    inOutDelta: [
      { value: 10n, valueOnRefSlot: 5n, refSlot: 1700000000 },
      { value: 20n, valueOnRefSlot: 15n, refSlot: 1700000000 },
    ] as const,
    minimalReserve: 100n,
    redemptionShares: 0n,
    cumulativeLidoFees: 50n,
    settledLidoFees: 25n,
  },
  totalValue: 2000n,
  liabilityStETH: 500n,
  nodeOperatorFeeRate: 1000n,
  accruedFee: 42n,
  isReportFresh: true,
  quarantineInfo: {
    isActive: true,
    pendingTotalValueIncrease: 300n,
    startTimestamp: 1700000000n,
    endTimestamp: 1700000600n,
    totalValueRemainder: 77n,
  },
  ...overrides,
});

describe('VaultViewer ABI decoding', () => {
  test('decodes vaultData with nonzero accruedFee and trailing fields', () => {
    const value = makeVaultData({ accruedFee: 42n, isReportFresh: true });

    const data = encodeAbiParameters([VAULT_DATA_REF], [value]);
    const decoded = decodeFunctionResult({
      abi: VaultViewerAbi,
      functionName: 'vaultData',
      data,
    });

    expect(decoded.vaultAddress).toBe(getAddress(value.vaultAddress));
    expect(decoded.totalValue).toBe(2000n);
    expect(decoded.liabilityStETH).toBe(500n);
    expect(decoded.nodeOperatorFeeRate).toBe(1000n);
    expect(decoded.accruedFee).toBe(42n);
    expect(decoded.isReportFresh).toBe(true);
    expect(decoded.quarantineInfo.totalValueRemainder).toBe(77n);
  });

  test('decodes vaultsDataBatch with zero and nonzero accruedFee entries', () => {
    const zeroFee = makeVaultData({
      vaultAddress: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      totalValue: 1111n,
      accruedFee: 0n,
      isReportFresh: false,
    });
    const nonzeroFee = makeVaultData({
      vaultAddress: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      totalValue: 2222n,
      accruedFee: 42n,
      isReportFresh: true,
    });

    const data = encodeAbiParameters(
      [VAULT_DATA_ARRAY_REF],
      [[zeroFee, nonzeroFee]],
    );
    const decoded = decodeFunctionResult({
      abi: VaultViewerAbi,
      functionName: 'vaultsDataBatch',
      data,
    });

    expect(decoded).toHaveLength(2);

    expect(decoded[0]!.vaultAddress).toBe(getAddress(zeroFee.vaultAddress));
    expect(decoded[0]!.totalValue).toBe(1111n);
    expect(decoded[0]!.accruedFee).toBe(0n);
    expect(decoded[0]!.isReportFresh).toBe(false);
    expect(decoded[0]!.quarantineInfo.totalValueRemainder).toBe(77n);

    expect(decoded[1]!.vaultAddress).toBe(getAddress(nonzeroFee.vaultAddress));
    expect(decoded[1]!.totalValue).toBe(2222n);
    expect(decoded[1]!.accruedFee).toBe(42n);
    expect(decoded[1]!.isReportFresh).toBe(true);
    expect(decoded[1]!.quarantineInfo.totalValueRemainder).toBe(77n);
  });
});

import { describe, test, expect, vi, beforeEach } from 'vitest';
import type { Address } from 'viem';
import { StandardMerkleTree } from '@openzeppelin/merkle-tree';
import {
  getVaultData,
  getReportProofByVault,
  getReportProofs,
} from '../utils/report-proof.js';
import type { Report } from '../types.js';

// ─── Mock IPFS fetch ──────────────────────────────────────────────────────────
vi.mock('../utils/ipfs.js', () => ({
  fetchIPFS: vi.fn(),
  fetchIPFSBuffer: vi.fn(),
  fetchIPFSVerify: vi.fn(),
  calculateIPFSAddCID: vi.fn(),
  IPFS_GATEWAY: 'https://ipfs.io/ipfs',
}));

import { fetchIPFS } from '../utils/ipfs.js';

// ─── Test fixtures ────────────────────────────────────────────────────────────
const VAULT_ADDRESS =
  '0x1234567890123456789012345678901234567890' as Address;
const VAULT_ADDRESS_2 =
  '0x2234567890123456789012345678901234567890' as Address;

const LEAF_ENCODING = [
  'address',
  'uint256',
  'uint256',
  'uint256',
  'uint256',
  'uint256',
] as const satisfies Report['leafEncoding'];

// Build a valid Merkle tree so that StandardMerkleTree.load() accepts the data
const RAW_VALUES: [string, string, string, string, string, string][] = [
  [
    VAULT_ADDRESS,
    '1000000000000000000',
    '50000000000000000',
    '500000000000000000',
    '600000000000000000',
    '100000000000000000',
  ],
  [
    VAULT_ADDRESS_2,
    '2000000000000000000',
    '100000000000000000',
    '1000000000000000000',
    '1200000000000000000',
    '200000000000000000',
  ],
];

const realTree = StandardMerkleTree.of(RAW_VALUES, [...LEAF_ENCODING]);
const treeDump = realTree.dump();

// Derive expected leaf hashes from the real tree for assertions
const vault1Entry = treeDump.values.find(
  (v) => v.value[0]?.toLowerCase() === VAULT_ADDRESS.toLowerCase(),
);
if (!vault1Entry) throw new Error('vault1Entry not found in tree');
const vault2Entry = treeDump.values.find(
  (v) => v.value[0]?.toLowerCase() === VAULT_ADDRESS_2.toLowerCase(),
);
if (!vault2Entry) throw new Error('vault2Entry not found in tree');

const EXPECTED_LEAF_1 = treeDump.tree[vault1Entry.treeIndex];
if (!EXPECTED_LEAF_1) throw new Error('EXPECTED_LEAF_1 not found in tree');
const EXPECTED_LEAF_2 = treeDump.tree[vault2Entry.treeIndex];
if (!EXPECTED_LEAF_2) throw new Error('EXPECTED_LEAF_2 not found in tree');

const MOCK_REPORT: Report = {
  format: 'standard-v1',
  leafEncoding: LEAF_ENCODING,
  tree: treeDump.tree as `0x${string}`[],
  values: treeDump.values.map(({ treeIndex, value }) => ({
    treeIndex: BigInt(treeIndex),
    value: value as [Address, string, string, string, string, string],
  })),
  refSlot: 12345,
  timestamp: 1700000000,
  blockNumber: 19000000n,
  prevTreeCID: 'QmPrevCID',
  leafIndexToData: {
    vault_address: 0,
    total_value_wei: 1,
    fee: 2,
    liability_shares: 3,
    max_liability_shares: 4,
    slashing_reserve: 5,
  },
  extraValues: {
    [VAULT_ADDRESS]: {
      inOutDelta: '500000000000000000',
      prevFee: '10000000000000000',
      infraFee: '5000000000000000',
      liquidityFee: '3000000000000000',
      reservationFee: '2000000000000000',
    },
    [VAULT_ADDRESS_2]: {
      inOutDelta: '1000000000000000000',
      prevFee: '20000000000000000',
      infraFee: '10000000000000000',
      liquidityFee: '6000000000000000',
      reservationFee: '4000000000000000',
    },
  },
};

const TEST_CID = 'QmTestCID123';

describe('getVaultData', () => {
  test('extracts vault data from report correctly', () => {
    const result = getVaultData(MOCK_REPORT, VAULT_ADDRESS, TEST_CID);

    expect(result).toBeDefined();
    expect(result.data.vaultAddress).toBe(VAULT_ADDRESS);
    expect(result.data.totalValueWei).toBe('1000000000000000000');
    expect(result.data.fee).toBe('50000000000000000');
    expect(result.data.liabilityShares).toBe('500000000000000000');
    expect(result.data.maxLiabilityShares).toBe('600000000000000000');
    expect(result.data.slashingReserve).toBe('100000000000000000');
  });

  test('includes extra data fields', () => {
    const result = getVaultData(MOCK_REPORT, VAULT_ADDRESS, TEST_CID);

    expect(result.extraData.inOutDelta).toBe('500000000000000000');
    expect(result.extraData.prevFee).toBe('10000000000000000');
    expect(result.extraData.infraFee).toBe('5000000000000000');
    expect(result.extraData.liquidityFee).toBe('3000000000000000');
    expect(result.extraData.reservationFee).toBe('2000000000000000');
  });

  test('includes metadata fields', () => {
    const result = getVaultData(MOCK_REPORT, VAULT_ADDRESS, TEST_CID);

    expect(result.refSlot).toBe(12345);
    expect(result.blockNumber).toBe(19000000);
    expect(result.timestamp).toBe(1700000000);
    expect(result.prevTreeCID).toBe('QmPrevCID');
    expect(result.cid).toBe(TEST_CID);
    expect(result.leaf).toBe(EXPECTED_LEAF_1);
  });

  test('works with case-insensitive vault address matching', () => {
    const uppercaseAddress = VAULT_ADDRESS.toUpperCase() as Address;
    const result = getVaultData(MOCK_REPORT, uppercaseAddress, TEST_CID);

    expect(result.data.vaultAddress).toBe(VAULT_ADDRESS);
  });

  test('throws when vault not found in report', () => {
    const unknownVault =
      '0x9999999999999999999999999999999999999999' as Address;

    expect(() => getVaultData(MOCK_REPORT, unknownVault, TEST_CID)).toThrow(
      'Vault not found',
    );
  });

  test('throws when leaf is missing from tree', () => {
    const reportWithBadIndex: Report = {
      ...MOCK_REPORT,
      values: [
        {
          treeIndex: 999n, // out of bounds
          value: [
            VAULT_ADDRESS,
            '1000000000000000000',
            '50000000000000000',
            '500000000000000000',
            '600000000000000000',
            '100000000000000000',
          ],
        },
      ],
    };

    expect(() =>
      getVaultData(reportWithBadIndex, VAULT_ADDRESS, TEST_CID),
    ).toThrow('Leaf not found');
  });

  test('extracts data for second vault correctly', () => {
    const result = getVaultData(MOCK_REPORT, VAULT_ADDRESS_2, TEST_CID);

    expect(result.data.vaultAddress).toBe(VAULT_ADDRESS_2);
    expect(result.data.totalValueWei).toBe('2000000000000000000');
    expect(result.leaf).toBe(EXPECTED_LEAF_2);
  });
});

describe('getReportProofByVault', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchIPFS).mockResolvedValue(MOCK_REPORT);
  });

  test('fetches IPFS data and returns proof', async () => {
    const result = await getReportProofByVault({
      vault: VAULT_ADDRESS,
      cid: TEST_CID,
    });

    expect(fetchIPFS).toHaveBeenCalledWith({
      cid: TEST_CID,
      vault: VAULT_ADDRESS,
    });
    expect(result).toBeDefined();
    expect(result.data.vaultAddress).toBe(VAULT_ADDRESS);
    expect(Array.isArray(result.proof)).toBe(true);
    expect(result.proof.length).toBeGreaterThan(0);
    // Each proof element should be a hex string
    for (const elem of result.proof) {
      expect(elem).toMatch(/^0x[0-9a-f]+$/i);
    }
  });

  test('proof verifies against the Merkle root', async () => {
    const result = await getReportProofByVault({
      vault: VAULT_ADDRESS,
      cid: TEST_CID,
    });

    // Re-load the tree and verify the proof is correct
    const tree = StandardMerkleTree.load({
      ...MOCK_REPORT,
      values: MOCK_REPORT.values.map(({ treeIndex, value }) => ({
        treeIndex: Number(treeIndex),
        value,
      })),
    });
    expect(() => tree.verify(0, result.proof)).not.toThrow();
  });

  test('throws when vault not found in fetched report', async () => {
    const unknownVault =
      '0x9999999999999999999999999999999999999999' as Address;

    await expect(
      getReportProofByVault({ vault: unknownVault, cid: TEST_CID }),
    ).rejects.toThrow(`Vault ${unknownVault} not found in report`);
  });
});

describe('getReportProofs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchIPFS).mockResolvedValue(MOCK_REPORT);
  });

  test('returns proofs for all vaults in report', async () => {
    const results = await getReportProofs({ cid: TEST_CID });

    expect(results).toHaveLength(2);
    const addresses = results.map((r) => r.data.vaultAddress);
    expect(addresses).toContain(VAULT_ADDRESS);
    expect(addresses).toContain(VAULT_ADDRESS_2);
  });

  test('each proof contains required data fields', async () => {
    const results = await getReportProofs({ cid: TEST_CID });

    for (const result of results) {
      expect(result.proof).toBeDefined();
      expect(Array.isArray(result.proof)).toBe(true);
      expect(result.proof.length).toBeGreaterThan(0);
      expect(result.data.vaultAddress).toBeDefined();
      expect(result.data.totalValueWei).toBeDefined();
      expect(result.data.liabilityShares).toBeDefined();
      expect(result.cid).toBe(TEST_CID);
    }
  });
});

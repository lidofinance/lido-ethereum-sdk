import { Address, Hex } from 'viem';
import { StandardMerkleTree } from '@openzeppelin/merkle-tree';

import { fetchIPFS } from './ipfs.js';
import {
  ExtraDataFields,
  LeafDataFields,
  Report,
  VaultReport,
  VaultReportArgs,
} from '../types.js';
import { snakeToCamel } from '../../common/utils/snake-to-camel.js';

export const getReportProofByVault = async (args: VaultReportArgs) => {
  const { vault } = args;

  const IPFSReportData = await fetchIPFS<Report>(args);

  const merkleTree = StandardMerkleTree.load({
    ...IPFSReportData,
    values: IPFSReportData.values.map(({ treeIndex, value }) => {
      return {
        value,
        treeIndex: Number(treeIndex),
      };
    }),
  });

  const vaultIndex = IPFSReportData.values.findIndex(
    ({ value }) => value[0].toLowerCase() === vault.toLowerCase(),
  );

  if (vaultIndex < 0) {
    throw new Error(`Vault ${vault} not found in report`);
  }
  const reportData = getVaultData(IPFSReportData, vault, args.cid);

  return {
    ...reportData,
    proof: merkleTree.getProof(vaultIndex) as Hex[],
  };
};

type GetReportProofByVaultsArgs = Omit<VaultReportArgs, 'vault'> & {
  vaults: Address[];
};

export const getReportProofByVaults = async (
  args: GetReportProofByVaultsArgs,
) => {
  const { vaults } = args;

  const proofs = await Promise.all(
    vaults.map((vault) => getReportProofByVault({ ...args, vault })),
  );

  return proofs;
};

export const getReportProofs = async (args: Omit<VaultReportArgs, 'vault'>) => {
  const report = await fetchIPFS<Report>(args);
  const vaultReports = report.values.map(
    (value) => getVaultData(report, value.value[0], args.cid).data,
  );
  const vaults = vaultReports.map((vault) => vault.vaultAddress);

  const proofs = await Promise.all(
    vaults.map((vault) =>
      getReportProofByVault({ ...args, vault: vault as Address }),
    ),
  );

  return proofs;
};

export const getVaultData = (
  report: Report,
  vault: Address,
  cid: string,
): VaultReport => {
  const match = report.values.find(
    (entry) => entry.value[0]?.toLowerCase() === vault.toLowerCase(),
  );

  if (!match) throw new Error('Vault not found');

  const leaf = report.tree[Number(match.treeIndex)];
  if (!leaf) throw new Error('Leaf not found');

  const data: LeafDataFields = {
    vaultAddress: '',
    fee: '',
    totalValueWei: '',
    liabilityShares: '',
    maxLiabilityShares: '',
    slashingReserve: '',
  };

  const extraData = report.extraValues[vault] as ExtraDataFields;

  for (const [fieldName, index] of Object.entries(report.leafIndexToData)) {
    const valueByIndex = match.value[index];
    if (valueByIndex === undefined) {
      throw new Error(
        `Missing value at index ${index} for field "${fieldName}"`,
      );
    }
    const camelCaseFieldName = snakeToCamel(fieldName) as keyof LeafDataFields;
    data[camelCaseFieldName] = valueByIndex.toString();
  }

  return {
    data,
    extraData,
    leaf,
    refSlot: report.refSlot,
    blockNumber: Number(report.blockNumber),
    timestamp: report.timestamp,
    prevTreeCID: report.prevTreeCID,
    cid,
  };
};

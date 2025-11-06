import { fetchIPFS, IPFS_GATEWAY } from './ipfs.js';
import { VaultReport, VaultReportArgs, Report } from '../types.js';
import { getVaultData } from './report-proof.js';

export const getVaultReport = async (
  args: VaultReportArgs,
): Promise<VaultReport> => {
  const { vault, cid, gateway = IPFS_GATEWAY, bigNumberType = 'string' } = args;

  const report = await fetchIPFS<Report>({
    cid,
    gateway,
    bigNumberType,
  });
  const vaultData = getVaultData(report, vault, cid);

  return vaultData;
};

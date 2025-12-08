import { Address } from 'viem';

import { getDashboardContract } from 'contracts';
import {
  calculateRebaseReward,
  callReadMethodSilent,
  calculateShareRate,
  reportMetrics,
} from 'utils';
import { VaultReport } from '../../types.js';

type StatisticDataArgs = {
  dashboard: Address;
  reports: { current: VaultReport; previous: VaultReport };
};

// @note from cli needed for api call instead
export const getReportStatisticData = async (args: StatisticDataArgs) => {
  const { dashboard, reports } = args;
  const dashboardContract = getDashboardContract(dashboard);
  const reportRefBlockNumber = reports.current.blockNumber;
  const reportPrevBlockNumber = reports.previous.blockNumber;

  const nodeOperatorFeeRate = await callReadMethodSilent(
    dashboardContract,
    'feeRate',
    {
      blockNumber: BigInt(reportRefBlockNumber),
    },
  );
  const [shareRatePrev, shareRateCurr] = await Promise.all([
    calculateShareRate(reportPrevBlockNumber),
    calculateShareRate(reportRefBlockNumber),
  ]);

  const stEthLiabilityRebaseRewards = calculateRebaseReward({
    shareRatePrev,
    shareRateCurr,
    sharesPrev: BigInt(reports.previous.data.liabilityShares),
    sharesCurr: BigInt(reports.current.data.liabilityShares),
  });

  const metrics = reportMetrics({
    reports: { current: reports.current, previous: reports.previous },
    nodeOperatorFeeRate: BigInt(nodeOperatorFeeRate),
    stEthLiabilityRebaseRewards,
  });

  return metrics;
};

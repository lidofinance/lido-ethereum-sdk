import { PublicClient } from 'viem';

export type FeeData = {
  lastBaseFeePerGas: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  gasPrice: bigint;
};

export const getFeeData = async (provider: PublicClient): Promise<FeeData> => {
  // we look back 5 blocks at fees of botton 25% txs
  // if you want to increase maxPriorityFee output increase percentile
  const feeHistory = await provider.getFeeHistory({
    blockCount: 5,
    blockTag: 'pending',
    rewardPercentiles: [25],
  });

  // get average priority fee
  const maxPriorityFeePerGas =
    feeHistory.reward && feeHistory.reward.length > 0
      ? feeHistory.reward
          .map((fees) => (fees[0] ? BigInt(fees[0]) : 0n))
          .reduce((sum, fee) => sum + fee) / BigInt(feeHistory.reward.length)
      : 0n;

  const lastBaseFeePerGas = feeHistory.baseFeePerGas[0]
    ? BigInt(feeHistory.baseFeePerGas[0])
    : 0n;

  // we have to multiply by 2 until we find a reliable way to predict baseFee change
  const maxFeePerGas = lastBaseFeePerGas * 2n + maxPriorityFeePerGas;

  return {
    lastBaseFeePerGas,
    maxPriorityFeePerGas,
    maxFeePerGas,
    gasPrice: maxFeePerGas, // fallback
  };
};

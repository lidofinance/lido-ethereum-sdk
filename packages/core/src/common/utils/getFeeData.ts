import { PublicClient, type BlockTag } from "viem";

export type FeeData = {
  lastBaseFeePerGas: null | bigint;
  maxFeePerGas: null | bigint;
  maxPriorityFeePerGas: null | bigint;
  gasPrice: null | bigint;
};

const getFeeHistory = (
  provider: PublicClient,
  blockCount: number,
  blockTag: BlockTag,
  rewardPercentiles: number[]
): Promise<{
  baseFeePerGas: bigint[];
  gasUsedRatio: number[];
  oldestBlock: bigint;
  reward?: bigint[][];
}> => {
  return provider.getFeeHistory({
    blockCount,
    rewardPercentiles,
    blockTag,
  });
};

export const getFeeData = async (provider: PublicClient): Promise<FeeData> => {
  // we look back 5 blocks at fees of botton 25% txs
  // if you want to increase maxPriorityFee output increase percentile
  const feeHistory = await getFeeHistory(provider, 5, "pending", [25]);

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

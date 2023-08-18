import { Client } from "viem";

export type FeeData = {
  lastBaseFeePerGas: null | bigint;
  maxFeePerGas: null | bigint;
  maxPriorityFeePerGas: null | bigint;
  gasPrice: null | bigint;
};

const getFeeHistory = (
  provider: Client,
  blockCount: number,
  latestBlock: string,
  percentile?: number[]
): Promise<{
  baseFeePerGas: string[];
  gasUsedRatio: number[];
  oldestBlock: string;
  reward: string[][];
}> => {
  return provider.request({
    method: "eth_feeHistory",
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    params: [`0x${blockCount.toString(16)}`, latestBlock, percentile],
  });
};

export const getFeeData = async (provider: Client): Promise<FeeData> => {
  // we look back 5 blocks at fees of botton 25% txs
  // if you want to increase maxPriorityFee output increase percentile
  const feeHistory = await getFeeHistory(provider, 5, "pending", [25]);

  // get average priority fee
  const maxPriorityFeePerGas =
    feeHistory.reward
      .map((fees) => (fees[0] ? BigInt(fees[0]) : 0n))
      .reduce((sum, fee) => sum + fee) / BigInt(feeHistory.reward.length);

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

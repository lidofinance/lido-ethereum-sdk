import { Provider, Web3Provider } from "@ethersproject/providers";
import { BigNumber } from "@ethersproject/bignumber";

export type FeeData = {
  lastBaseFeePerGas: null | BigNumber;
  maxFeePerGas: null | BigNumber;
  maxPriorityFeePerGas: null | BigNumber;
  gasPrice: null | BigNumber;
};

export const getFeeData = async (
  provider: Provider | Web3Provider
): Promise<FeeData> => {
  // TODO: change for cold wallets
  if (!(provider instanceof Web3Provider))
    throw new Error("Provider is not Web3Provider");

  const [block, eth_maxPriorityFeePerGas] = await Promise.all([
    await provider?.getBlock("latest"),
    await provider?.send("eth_maxPriorityFeePerGas", []),
  ]);

  const result: FeeData = {
    lastBaseFeePerGas: null,
    maxFeePerGas: null,
    maxPriorityFeePerGas: null,
    gasPrice: null,
  };

  if (block.baseFeePerGas) {
    result.lastBaseFeePerGas = block.baseFeePerGas;
    result.maxPriorityFeePerGas = BigNumber.from(eth_maxPriorityFeePerGas);
    result.maxFeePerGas = block.baseFeePerGas
      .mul(2)
      .add(result.maxPriorityFeePerGas);
  } else {
    result.gasPrice = await provider.getGasPrice();
  }

  return result;
};

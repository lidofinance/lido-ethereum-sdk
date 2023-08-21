import { type PublicClient, type Address } from "viem";

export const checkIsContract = async (
  rpcProvider: PublicClient,
  address: Address
): Promise<{ isContract: boolean }> => {
  // eth_getCode returns hex string of bytecode at address
  // for accounts it's "0x"
  // for contract it's potentially very long hex (can't be safely&quickly parsed)
  const result = await rpcProvider.getBytecode({ address: address });

  return {
    isContract: result ? result !== "0x" : false,
  };
};

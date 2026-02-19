import type { Abi } from 'viem';

const abi = [
  {
    inputs: [],
    name: 'WSTETH',
    outputs: [{ internalType: 'contract IWstETH', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const satisfies Abi;

export type wqWstethAddressAbiType = typeof abi;

export const wqWstethAddressAbi: wqWstethAddressAbiType = abi;

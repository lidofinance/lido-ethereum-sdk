import type { Abi } from 'viem';
const abi = [
  {
    inputs: [],
    name: 'getGovernance',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const satisfies Abi;

export type emergencyProtectedTimelockAbiType = typeof abi;
export const emergencyProtectedTimelockAbi: emergencyProtectedTimelockAbiType =
  abi;

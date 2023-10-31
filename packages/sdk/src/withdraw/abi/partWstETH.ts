import { PartStethAbi } from './partStETH.js';

export const PartWstethAbi = [
  ...PartStethAbi,
  {
    inputs: [
      { internalType: 'uint256', name: '_stETHAmount', type: 'uint256' },
    ],
    name: 'getWstETHByStETH',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

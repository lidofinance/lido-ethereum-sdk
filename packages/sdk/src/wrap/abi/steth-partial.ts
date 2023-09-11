export const stethPartialAbi = [
  {
    constant: true,
    inputs: [],
    name: 'getStakeLimitFullInfo',
    outputs: [
      { name: 'isStakingPaused', type: 'bool' },
      { name: 'isStakingLimitSet', type: 'bool' },
      { name: 'currentStakeLimit', type: 'uint256' },
      { name: 'maxStakeLimit', type: 'uint256' },
      { name: 'maxStakeLimitGrowthBlocks', type: 'uint256' },
      { name: 'prevStakeLimit', type: 'uint256' },
      { name: 'prevStakeBlockNumber', type: 'uint256' },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: '_spender', type: 'address' },
      { name: '_amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      { name: '_owner', type: 'address' },
      { name: '_spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
] as const;

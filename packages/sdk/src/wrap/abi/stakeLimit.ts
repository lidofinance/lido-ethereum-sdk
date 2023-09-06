export const stakeLimitAbi = [
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
] as const;

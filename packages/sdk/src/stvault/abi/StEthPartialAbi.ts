export const StEthPartialAbi = [
  {
    constant: true,
    inputs: [
      {
        name: '_sharesAmount',
        type: 'uint256',
      },
    ],
    name: 'getPooledEthBySharesRoundUp',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: '_sharesAmount',
        type: 'uint256',
      },
    ],
    name: 'getPooledEthByShares',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: '_ethAmount',
        type: 'uint256',
      },
    ],
    name: 'getSharesByPooledEth',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
] as const;

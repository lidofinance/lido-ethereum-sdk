export const rewardsEventsAbi = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'from', type: 'address' },
      { indexed: true, name: 'to', type: 'address' },
      { indexed: false, name: 'sharesValue', type: 'uint256' },
    ],
    name: 'TransferShares',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'reportTimestamp', type: 'uint256' },
      { indexed: false, name: 'timeElapsed', type: 'uint256' },
      { indexed: false, name: 'preTotalShares', type: 'uint256' },
      { indexed: false, name: 'preTotalEther', type: 'uint256' },
      { indexed: false, name: 'postTotalShares', type: 'uint256' },
      { indexed: false, name: 'postTotalEther', type: 'uint256' },
      { indexed: false, name: 'sharesMintedAsFees', type: 'uint256' },
    ],
    name: 'TokenRebased',
    type: 'event',
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'getTotalShares',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'getTotalPooledEther',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [{ name: '_account', type: 'address' }],
    name: 'sharesOf',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
] as const;

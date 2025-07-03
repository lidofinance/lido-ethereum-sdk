export const escrow = [
  {
    inputs: [],
    name: 'ST_ETH',
    outputs: [{ internalType: 'contract IStETH', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getSignallingEscrowDetails',
    outputs: [
      {
        components: [
          {
            internalType: 'SharesValue',
            name: 'totalStETHLockedShares',
            type: 'uint128',
          },
          {
            internalType: 'ETHValue',
            name: 'totalStETHClaimedETH',
            type: 'uint128',
          },
          {
            internalType: 'SharesValue',
            name: 'totalUnstETHUnfinalizedShares',
            type: 'uint128',
          },
          {
            internalType: 'ETHValue',
            name: 'totalUnstETHFinalizedETH',
            type: 'uint128',
          },
        ],
        internalType: 'struct ISignallingEscrow.SignallingEscrowDetails',
        name: 'details',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  { stateMutability: 'payable', type: 'receive' },
] as const;

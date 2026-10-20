// Minimal read surface of Mellow's vault Oracle: only the report used for position valuation.
export const EARN_ORACLE_ABI = [
  {
    inputs: [{ internalType: 'address', name: 'asset', type: 'address' }],
    name: 'getReport',
    outputs: [
      {
        components: [
          { internalType: 'uint224', name: 'priceD18', type: 'uint224' },
          { internalType: 'uint32', name: 'timestamp', type: 'uint32' },
          { internalType: 'bool', name: 'isSuspicious', type: 'bool' },
        ],
        internalType: 'struct IOracle.DetailedReport',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export const dgConfigProviderAbi = [
  {
    type: 'function',
    name: 'getDualGovernanceConfig',
    inputs: [],
    outputs: [
      {
        name: 'config',
        type: 'tuple',
        internalType: 'struct DualGovernanceConfig.Context',
        components: [
          {
            name: 'firstSealRageQuitSupport',
            type: 'uint256',
            internalType: 'PercentD16',
          },
          {
            name: 'secondSealRageQuitSupport',
            type: 'uint256',
            internalType: 'PercentD16',
          },
          {
            name: 'minAssetsLockDuration',
            type: 'uint32',
            internalType: 'Duration',
          },
          {
            name: 'vetoSignallingMinDuration',
            type: 'uint32',
            internalType: 'Duration',
          },
          {
            name: 'vetoSignallingMaxDuration',
            type: 'uint32',
            internalType: 'Duration',
          },
          {
            name: 'vetoSignallingMinActiveDuration',
            type: 'uint32',
            internalType: 'Duration',
          },
          {
            name: 'vetoSignallingDeactivationMaxDuration',
            type: 'uint32',
            internalType: 'Duration',
          },
          {
            name: 'vetoCooldownDuration',
            type: 'uint32',
            internalType: 'Duration',
          },
          {
            name: 'rageQuitExtensionPeriodDuration',
            type: 'uint32',
            internalType: 'Duration',
          },
          {
            name: 'rageQuitEthWithdrawalsMinDelay',
            type: 'uint32',
            internalType: 'Duration',
          },
          {
            name: 'rageQuitEthWithdrawalsMaxDelay',
            type: 'uint32',
            internalType: 'Duration',
          },
          {
            name: 'rageQuitEthWithdrawalsDelayGrowth',
            type: 'uint32',
            internalType: 'Duration',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
] as const;

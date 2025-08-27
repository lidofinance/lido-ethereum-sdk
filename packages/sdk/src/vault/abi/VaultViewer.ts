export const VaultViewerAbi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_lidoLocator',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_from',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_to',
        type: 'uint256',
      },
    ],
    name: 'WrongPaginationRange',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'argName',
        type: 'string',
      },
    ],
    name: 'ZeroArgument',
    type: 'error',
  },
  {
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'LAZY_ORACLE',
    outputs: [
      {
        internalType: 'contract LazyOracle',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'LIDO_LOCATOR',
    outputs: [
      {
        internalType: 'contract ILidoLocator',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'VAULT_HUB',
    outputs: [
      {
        internalType: 'contract VaultHub',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vaultAddress',
        type: 'address',
      },
      {
        internalType: 'bytes32[]',
        name: 'roles',
        type: 'bytes32[]',
      },
    ],
    name: 'getRoleMembers',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'vault',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'owner',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'nodeOperator',
            type: 'address',
          },
          {
            internalType: 'address[][]',
            name: 'members',
            type: 'address[][]',
          },
        ],
        internalType: 'struct VaultViewer.VaultMembers',
        name: 'roleMembers',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address[]',
        name: 'vaultAddresses',
        type: 'address[]',
      },
      {
        internalType: 'bytes32[]',
        name: 'roles',
        type: 'bytes32[]',
      },
    ],
    name: 'getRoleMembersBatch',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'vault',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'owner',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'nodeOperator',
            type: 'address',
          },
          {
            internalType: 'address[][]',
            name: 'members',
            type: 'address[][]',
          },
        ],
        internalType: 'struct VaultViewer.VaultMembers[]',
        name: 'result',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
    ],
    name: 'getVaultData',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'vaultAddress',
            type: 'address',
          },
          {
            components: [
              {
                internalType: 'address',
                name: 'owner',
                type: 'address',
              },
              {
                internalType: 'uint96',
                name: 'shareLimit',
                type: 'uint96',
              },
              {
                internalType: 'uint96',
                name: 'vaultIndex',
                type: 'uint96',
              },
              {
                internalType: 'bool',
                name: 'pendingDisconnect',
                type: 'bool',
              },
              {
                internalType: 'uint16',
                name: 'reserveRatioBP',
                type: 'uint16',
              },
              {
                internalType: 'uint16',
                name: 'forcedRebalanceThresholdBP',
                type: 'uint16',
              },
              {
                internalType: 'uint16',
                name: 'infraFeeBP',
                type: 'uint16',
              },
              {
                internalType: 'uint16',
                name: 'liquidityFeeBP',
                type: 'uint16',
              },
              {
                internalType: 'uint16',
                name: 'reservationFeeBP',
                type: 'uint16',
              },
              {
                internalType: 'bool',
                name: 'isBeaconDepositsManuallyPaused',
                type: 'bool',
              },
            ],
            internalType: 'struct VaultHub.VaultConnection',
            name: 'connection',
            type: 'tuple',
          },
          {
            components: [
              {
                components: [
                  {
                    internalType: 'uint112',
                    name: 'totalValue',
                    type: 'uint112',
                  },
                  {
                    internalType: 'int112',
                    name: 'inOutDelta',
                    type: 'int112',
                  },
                  {
                    internalType: 'uint32',
                    name: 'timestamp',
                    type: 'uint32',
                  },
                ],
                internalType: 'struct VaultHub.Report',
                name: 'report',
                type: 'tuple',
              },
              {
                internalType: 'uint128',
                name: 'locked',
                type: 'uint128',
              },
              {
                internalType: 'uint96',
                name: 'liabilityShares',
                type: 'uint96',
              },
              {
                components: [
                  {
                    internalType: 'int112',
                    name: 'value',
                    type: 'int112',
                  },
                  {
                    internalType: 'int112',
                    name: 'valueOnRefSlot',
                    type: 'int112',
                  },
                  {
                    internalType: 'uint32',
                    name: 'refSlot',
                    type: 'uint32',
                  },
                ],
                internalType: 'struct RefSlotCache.Int112WithRefSlotCache',
                name: 'inOutDelta',
                type: 'tuple',
              },
            ],
            internalType: 'struct VaultHub.VaultRecord',
            name: 'record',
            type: 'tuple',
          },
          {
            internalType: 'uint256',
            name: 'totalValue',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'liabilityStETH',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'nodeOperatorFeeRate',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'isReportFresh',
            type: 'bool',
          },
          {
            components: [
              {
                internalType: 'bool',
                name: 'isActive',
                type: 'bool',
              },
              {
                internalType: 'uint256',
                name: 'pendingTotalValueIncrease',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'startTimestamp',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'endTimestamp',
                type: 'uint256',
              },
            ],
            internalType: 'struct LazyOracle.QuarantineInfo',
            name: 'quarantineInfo',
            type: 'tuple',
          },
        ],
        internalType: 'struct VaultViewer.VaultData',
        name: 'data',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_from',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_to',
        type: 'uint256',
      },
    ],
    name: 'getVaultsDataBound',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'vaultAddress',
            type: 'address',
          },
          {
            components: [
              {
                internalType: 'address',
                name: 'owner',
                type: 'address',
              },
              {
                internalType: 'uint96',
                name: 'shareLimit',
                type: 'uint96',
              },
              {
                internalType: 'uint96',
                name: 'vaultIndex',
                type: 'uint96',
              },
              {
                internalType: 'bool',
                name: 'pendingDisconnect',
                type: 'bool',
              },
              {
                internalType: 'uint16',
                name: 'reserveRatioBP',
                type: 'uint16',
              },
              {
                internalType: 'uint16',
                name: 'forcedRebalanceThresholdBP',
                type: 'uint16',
              },
              {
                internalType: 'uint16',
                name: 'infraFeeBP',
                type: 'uint16',
              },
              {
                internalType: 'uint16',
                name: 'liquidityFeeBP',
                type: 'uint16',
              },
              {
                internalType: 'uint16',
                name: 'reservationFeeBP',
                type: 'uint16',
              },
              {
                internalType: 'bool',
                name: 'isBeaconDepositsManuallyPaused',
                type: 'bool',
              },
            ],
            internalType: 'struct VaultHub.VaultConnection',
            name: 'connection',
            type: 'tuple',
          },
          {
            components: [
              {
                components: [
                  {
                    internalType: 'uint112',
                    name: 'totalValue',
                    type: 'uint112',
                  },
                  {
                    internalType: 'int112',
                    name: 'inOutDelta',
                    type: 'int112',
                  },
                  {
                    internalType: 'uint32',
                    name: 'timestamp',
                    type: 'uint32',
                  },
                ],
                internalType: 'struct VaultHub.Report',
                name: 'report',
                type: 'tuple',
              },
              {
                internalType: 'uint128',
                name: 'locked',
                type: 'uint128',
              },
              {
                internalType: 'uint96',
                name: 'liabilityShares',
                type: 'uint96',
              },
              {
                components: [
                  {
                    internalType: 'int112',
                    name: 'value',
                    type: 'int112',
                  },
                  {
                    internalType: 'int112',
                    name: 'valueOnRefSlot',
                    type: 'int112',
                  },
                  {
                    internalType: 'uint32',
                    name: 'refSlot',
                    type: 'uint32',
                  },
                ],
                internalType: 'struct RefSlotCache.Int112WithRefSlotCache',
                name: 'inOutDelta',
                type: 'tuple',
              },
            ],
            internalType: 'struct VaultHub.VaultRecord',
            name: 'record',
            type: 'tuple',
          },
          {
            internalType: 'uint256',
            name: 'totalValue',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'liabilityStETH',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'nodeOperatorFeeRate',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'isReportFresh',
            type: 'bool',
          },
          {
            components: [
              {
                internalType: 'bool',
                name: 'isActive',
                type: 'bool',
              },
              {
                internalType: 'uint256',
                name: 'pendingTotalValueIncrease',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'startTimestamp',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'endTimestamp',
                type: 'uint256',
              },
            ],
            internalType: 'struct LazyOracle.QuarantineInfo',
            name: 'quarantineInfo',
            type: 'tuple',
          },
        ],
        internalType: 'struct VaultViewer.VaultData[]',
        name: 'vaultsData',
        type: 'tuple[]',
      },
      {
        internalType: 'uint256',
        name: 'leftover',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IStakingVault',
        name: 'vault',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_member',
        type: 'address',
      },
      {
        internalType: 'bytes32',
        name: '_role',
        type: 'bytes32',
      },
    ],
    name: 'hasRole',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'isContract',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IStakingVault',
        name: 'vault',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_owner',
        type: 'address',
      },
    ],
    name: 'isOwner',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_owner',
        type: 'address',
      },
    ],
    name: 'vaultsByOwner',
    outputs: [
      {
        internalType: 'contract IStakingVault[]',
        name: '',
        type: 'address[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_owner',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_from',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_to',
        type: 'uint256',
      },
    ],
    name: 'vaultsByOwnerBound',
    outputs: [
      {
        internalType: 'contract IStakingVault[]',
        name: '',
        type: 'address[]',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '_role',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: '_member',
        type: 'address',
      },
    ],
    name: 'vaultsByRole',
    outputs: [
      {
        internalType: 'contract IStakingVault[]',
        name: '',
        type: 'address[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '_role',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: '_member',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_from',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_to',
        type: 'uint256',
      },
    ],
    name: 'vaultsByRoleBound',
    outputs: [
      {
        internalType: 'contract IStakingVault[]',
        name: '',
        type: 'address[]',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'vaultsConnected',
    outputs: [
      {
        internalType: 'contract IStakingVault[]',
        name: '',
        type: 'address[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_from',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_to',
        type: 'uint256',
      },
    ],
    name: 'vaultsConnectedBound',
    outputs: [
      {
        internalType: 'contract IStakingVault[]',
        name: '',
        type: 'address[]',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

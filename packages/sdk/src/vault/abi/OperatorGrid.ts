export const OperatorGridErrorsAbi = [
  {
    inputs: [],
    name: 'AccessControlBadConfirmation',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        internalType: 'bytes32',
        name: 'neededRole',
        type: 'bytes32',
      },
    ],
    name: 'AccessControlUnauthorizedAccount',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ArrayLengthMismatch',
    type: 'error',
  },
  {
    inputs: [],
    name: 'CannotChangeToDefaultTier',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ConfirmExpiryOutOfBounds',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'tierId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'forcedRebalanceThresholdBP',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'reserveRatioBP',
        type: 'uint256',
      },
    ],
    name: 'ForcedRebalanceThresholdTooHigh',
    type: 'error',
  },
  {
    inputs: [],
    name: 'GroupExists',
    type: 'error',
  },
  {
    inputs: [],
    name: 'GroupLimitExceeded',
    type: 'error',
  },
  {
    inputs: [],
    name: 'GroupNotExists',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'tierId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'infraFeeBP',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'maxInfraFeeBP',
        type: 'uint256',
      },
    ],
    name: 'InfraFeeTooHigh',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidInitialization',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'tierId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'liquidityFeeBP',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'maxLiquidityFeeBP',
        type: 'uint256',
      },
    ],
    name: 'LiquidityFeeTooHigh',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NodeOperatorNotExists',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'operation',
        type: 'string',
      },
      {
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
    ],
    name: 'NotAuthorized',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NotInitializing',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'requestedShareLimit',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'tierShareLimit',
        type: 'uint256',
      },
    ],
    name: 'RequestedShareLimitTooHigh',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'tierId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'reservationFeeBP',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'maxReservationFeeBP',
        type: 'uint256',
      },
    ],
    name: 'ReservationFeeTooHigh',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'tierId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'reserveRatioBP',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'maxReserveRatioBP',
        type: 'uint256',
      },
    ],
    name: 'ReserveRatioTooHigh',
    type: 'error',
  },
  {
    inputs: [],
    name: 'SenderNotMember',
    type: 'error',
  },
  {
    inputs: [],
    name: 'TierAlreadySet',
    type: 'error',
  },
  {
    inputs: [],
    name: 'TierLimitExceeded',
    type: 'error',
  },
  {
    inputs: [],
    name: 'TierNotExists',
    type: 'error',
  },
  {
    inputs: [],
    name: 'TierNotInOperatorGroup',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'argument',
        type: 'string',
      },
    ],
    name: 'ZeroArgument',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ZeroConfirmingRoles',
    type: 'error',
  },
] as const;

export const OperatorGridAbi = [
  ...OperatorGridErrorsAbi,
  {
    inputs: [
      {
        internalType: 'contract ILidoLocator',
        name: '_locator',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'oldConfirmExpiry',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newConfirmExpiry',
        type: 'uint256',
      },
    ],
    name: 'ConfirmExpirySet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'nodeOperator',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'shareLimit',
        type: 'uint256',
      },
    ],
    name: 'GroupAdded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'nodeOperator',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'shareLimit',
        type: 'uint256',
      },
    ],
    name: 'GroupShareLimitUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint64',
        name: 'version',
        type: 'uint64',
      },
    ],
    name: 'Initialized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'previousAdminRole',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'newAdminRole',
        type: 'bytes32',
      },
    ],
    name: 'RoleAdminChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
    ],
    name: 'RoleGranted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'member',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'confirmTimestamp',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'expiryTimestamp',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'RoleMemberConfirmed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
    ],
    name: 'RoleRevoked',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'nodeOperator',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'tierId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'shareLimit',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'reserveRatioBP',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'forcedRebalanceThresholdBP',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'infraFeeBP',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'liquidityFeeBP',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'reservationFeeBP',
        type: 'uint256',
      },
    ],
    name: 'TierAdded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'tierId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'shareLimit',
        type: 'uint256',
      },
    ],
    name: 'TierChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'tierId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'shareLimit',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'reserveRatioBP',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'forcedRebalanceThresholdBP',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'infraFeeBP',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'liquidityFeeBP',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'reservationFeeBP',
        type: 'uint256',
      },
    ],
    name: 'TierUpdated',
    type: 'event',
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
    name: 'DEFAULT_TIER_ID',
    outputs: [
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
    name: 'DEFAULT_TIER_OPERATOR',
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
    name: 'MAX_CONFIRM_EXPIRY',
    outputs: [
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
    name: 'MIN_CONFIRM_EXPIRY',
    outputs: [
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
    name: 'REGISTRY_ROLE',
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
    inputs: [
      {
        internalType: 'uint256[]',
        name: '_tierIds',
        type: 'uint256[]',
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'shareLimit',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'reserveRatioBP',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'forcedRebalanceThresholdBP',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'infraFeeBP',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'liquidityFeeBP',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'reservationFeeBP',
            type: 'uint256',
          },
        ],
        internalType: 'struct TierParams[]',
        name: '_tierParams',
        type: 'tuple[]',
      },
    ],
    name: 'alterTiers',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_vault',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_requestedTierId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_requestedShareLimit',
        type: 'uint256',
      },
    ],
    name: 'changeTier',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: '_callData',
        type: 'bytes',
      },
      {
        internalType: 'bytes32',
        name: '_role',
        type: 'bytes32',
      },
    ],
    name: 'confirmation',
    outputs: [
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
        internalType: 'address',
        name: '_vault',
        type: 'address',
      },
    ],
    name: 'effectiveShareLimit',
    outputs: [
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
    name: 'getConfirmExpiry',
    outputs: [
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
        name: 'role',
        type: 'bytes32',
      },
    ],
    name: 'getRoleAdmin',
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
    inputs: [
      {
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        internalType: 'uint256',
        name: 'index',
        type: 'uint256',
      },
    ],
    name: 'getRoleMember',
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
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
    ],
    name: 'getRoleMemberCount',
    outputs: [
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
        name: 'role',
        type: 'bytes32',
      },
    ],
    name: 'getRoleMembers',
    outputs: [
      {
        internalType: 'address[]',
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
        name: 'role',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_nodeOperator',
        type: 'address',
      },
    ],
    name: 'group',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'operator',
            type: 'address',
          },
          {
            internalType: 'uint96',
            name: 'shareLimit',
            type: 'uint96',
          },
          {
            internalType: 'uint96',
            name: 'liabilityShares',
            type: 'uint96',
          },
          {
            internalType: 'uint256[]',
            name: 'tierIds',
            type: 'uint256[]',
          },
        ],
        internalType: 'struct OperatorGrid.Group',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
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
        name: '_admin',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'shareLimit',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'reserveRatioBP',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'forcedRebalanceThresholdBP',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'infraFeeBP',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'liquidityFeeBP',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'reservationFeeBP',
            type: 'uint256',
          },
        ],
        internalType: 'struct TierParams',
        name: '_defaultTierParams',
        type: 'tuple',
      },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_index',
        type: 'uint256',
      },
    ],
    name: 'nodeOperatorAddress',
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
  {
    inputs: [],
    name: 'nodeOperatorCount',
    outputs: [
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
        internalType: 'address',
        name: '_vault',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256',
      },
    ],
    name: 'onBurnedShares',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_vault',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256',
      },
    ],
    name: 'onMintedShares',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_nodeOperator',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_shareLimit',
        type: 'uint256',
      },
    ],
    name: 'registerGroup',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_nodeOperator',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'shareLimit',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'reserveRatioBP',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'forcedRebalanceThresholdBP',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'infraFeeBP',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'liquidityFeeBP',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'reservationFeeBP',
            type: 'uint256',
          },
        ],
        internalType: 'struct TierParams[]',
        name: '_tiers',
        type: 'tuple[]',
      },
    ],
    name: 'registerTiers',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'callerConfirmation',
        type: 'address',
      },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_vault',
        type: 'address',
      },
    ],
    name: 'resetVaultTier',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes4',
        name: 'interfaceId',
        type: 'bytes4',
      },
    ],
    name: 'supportsInterface',
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
        internalType: 'uint256',
        name: '_tierId',
        type: 'uint256',
      },
    ],
    name: 'tier',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'operator',
            type: 'address',
          },
          {
            internalType: 'uint96',
            name: 'shareLimit',
            type: 'uint96',
          },
          {
            internalType: 'uint96',
            name: 'liabilityShares',
            type: 'uint96',
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
        ],
        internalType: 'struct OperatorGrid.Tier',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'tiersCount',
    outputs: [
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
        internalType: 'address',
        name: '_nodeOperator',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_shareLimit',
        type: 'uint256',
      },
    ],
    name: 'updateGroupShareLimit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_vault',
        type: 'address',
      },
    ],
    name: 'vaultInfo',
    outputs: [
      {
        internalType: 'address',
        name: 'nodeOperator',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'tierId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'shareLimit',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'reserveRatioBP',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'forcedRebalanceThresholdBP',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'infraFeeBP',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'liquidityFeeBP',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'reservationFeeBP',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

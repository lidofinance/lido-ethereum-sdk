export const StakingVaultErrorsAbi = [
  {
    inputs: [],
    name: 'AlreadyOssified',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BeaconChainDepositsAlreadyPaused',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BeaconChainDepositsAlreadyResumed',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BeaconChainDepositsOnPause',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_balance',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_required',
        type: 'uint256',
      },
    ],
    name: 'InsufficientBalance',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_passed',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_required',
        type: 'uint256',
      },
    ],
    name: 'InsufficientValidatorWithdrawalFee',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidInitialization',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidPubkeysLength',
    type: 'error',
  },
  {
    inputs: [],
    name: 'MalformedPubkeysArray',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'keysCount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amountsCount',
        type: 'uint256',
      },
    ],
    name: 'MismatchedArrayLengths',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NewDepositorSameAsPrevious',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NoWithdrawalRequests',
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
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'OwnableInvalidOwner',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'OwnableUnauthorizedAccount',
    type: 'error',
  },
  {
    inputs: [],
    name: 'PubkeyLengthDoesNotMatchAmountLength',
    type: 'error',
  },
  {
    inputs: [],
    name: 'SenderNotDepositor',
    type: 'error',
  },
  {
    inputs: [],
    name: 'SenderNotNodeOperator',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'TransferFailed',
    type: 'error',
  },
  {
    inputs: [],
    name: 'VaultOssified',
    type: 'error',
  },
  {
    inputs: [],
    name: 'WithdrawalFeeInvalidData',
    type: 'error',
  },
  {
    inputs: [],
    name: 'WithdrawalFeeReadFailed',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'callData',
        type: 'bytes',
      },
    ],
    name: 'WithdrawalRequestAdditionFailed',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'name',
        type: 'string',
      },
    ],
    name: 'ZeroArgument',
    type: 'error',
  },
] as const;

export const StakingVaultAbi = [
  ...StakingVaultErrorsAbi,
  {
    inputs: [
      {
        internalType: 'address',
        name: '_beaconChainDepositContract',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [],
    name: 'BeaconChainDepositsPaused',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [],
    name: 'BeaconChainDepositsResumed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: '_deposits',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: '_totalAmount',
        type: 'uint256',
      },
    ],
    name: 'DepositedToBeaconChain',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousDepositor',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newDepositor',
        type: 'address',
      },
    ],
    name: 'DepositorSet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'EtherFunded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'EtherWithdrawn',
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
        internalType: 'address',
        name: 'nodeOperator',
        type: 'address',
      },
    ],
    name: 'NodeOperatorSet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferStarted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'implementation',
        type: 'address',
      },
    ],
    name: 'PinnedImplementationUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes',
        name: 'pubkeys',
        type: 'bytes',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'excess',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'refundRecipient',
        type: 'address',
      },
    ],
    name: 'ValidatorEjectionsTriggered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes',
        name: 'pubkey',
        type: 'bytes',
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: 'pubkeyRaw',
        type: 'bytes',
      },
    ],
    name: 'ValidatorExitRequested',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes',
        name: 'pubkeys',
        type: 'bytes',
      },
      {
        indexed: false,
        internalType: 'uint64[]',
        name: 'amounts',
        type: 'uint64[]',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'excess',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'refundRecipient',
        type: 'address',
      },
    ],
    name: 'ValidatorWithdrawalsTriggered',
    type: 'event',
  },
  {
    inputs: [],
    name: 'DEPOSIT_CONTRACT',
    outputs: [
      {
        internalType: 'contract IDepositContract',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'acceptOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'beaconChainDepositsPaused',
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
        name: '_numberOfKeys',
        type: 'uint256',
      },
    ],
    name: 'calculateValidatorWithdrawalFee',
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
        components: [
          {
            internalType: 'bytes',
            name: 'pubkey',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'signature',
            type: 'bytes',
          },
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
          },
          {
            internalType: 'bytes32',
            name: 'depositDataRoot',
            type: 'bytes32',
          },
        ],
        internalType: 'struct IStakingVault.Deposit[]',
        name: '_deposits',
        type: 'tuple[]',
      },
    ],
    name: 'depositToBeaconChain',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'depositor',
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
        internalType: 'bytes',
        name: '_pubkeys',
        type: 'bytes',
      },
      {
        internalType: 'address',
        name: '_refundRecipient',
        type: 'address',
      },
    ],
    name: 'ejectValidators',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'fund',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getInitializedVersion',
    outputs: [
      {
        internalType: 'uint64',
        name: '',
        type: 'uint64',
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
        internalType: 'address',
        name: '_nodeOperator',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_depositor',
        type: 'address',
      },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'isOssified',
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
    inputs: [],
    name: 'nodeOperator',
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
    name: 'ossify',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
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
    name: 'pauseBeaconChainDeposits',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pendingOwner',
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
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: '_pubkeys',
        type: 'bytes',
      },
    ],
    name: 'requestValidatorExit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'resumeBeaconChainDeposits',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_depositor',
        type: 'address',
      },
    ],
    name: 'setDepositor',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: '_pubkeys',
        type: 'bytes',
      },
      {
        internalType: 'uint64[]',
        name: '_amounts',
        type: 'uint64[]',
      },
      {
        internalType: 'address',
        name: '_excessRefundRecipient',
        type: 'address',
      },
    ],
    name: 'triggerValidatorWithdrawals',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'version',
    outputs: [
      {
        internalType: 'uint64',
        name: '',
        type: 'uint64',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_recipient',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_ether',
        type: 'uint256',
      },
    ],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'withdrawalCredentials',
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
    stateMutability: 'payable',
    type: 'receive',
  },
] as const;

import { StakingVaultErrorsAbi } from './StakingVault.js';

export const PredepositGuaranteeAbi = [
  ...StakingVaultErrorsAbi,
  {
    inputs: [
      {
        internalType: 'bytes4',
        name: '_genesisForkVersion',
        type: 'bytes4',
      },
      {
        internalType: 'GIndex',
        name: '_gIFirstValidator',
        type: 'bytes32',
      },
      {
        internalType: 'GIndex',
        name: '_gIFirstValidatorAfterChange',
        type: 'bytes32',
      },
      {
        internalType: 'uint64',
        name: '_changeSlot',
        type: 'uint64',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
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
    name: 'CompensateFailed',
    type: 'error',
  },
  {
    inputs: [],
    name: 'CompensateToVaultNotAllowed',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'validatorPubkey',
        type: 'bytes',
      },
      {
        internalType: 'enum PredepositGuarantee.ValidatorStage',
        name: 'stage',
        type: 'uint8',
      },
    ],
    name: 'DepositToUnprovenValidator',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'validatorPubkey',
        type: 'bytes',
      },
      {
        internalType: 'address',
        name: 'stakingVault',
        type: 'address',
      },
    ],
    name: 'DepositToWrongVault',
    type: 'error',
  },
  {
    inputs: [],
    name: 'EmptyDeposits',
    type: 'error',
  },
  {
    inputs: [],
    name: 'IndexOutOfRange',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InputHasInfinityPoints',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidInitialization',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidPubkeyLength',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidSignature',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidSlot',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidTimestamp',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'locked',
        type: 'uint256',
      },
    ],
    name: 'LockedIsNotZero',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NotDepositor',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'unlocked',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'NotEnoughUnlocked',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NotGuarantor',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NotInitializing',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NotStakingVaultOwner',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NothingToRefund',
    type: 'error',
  },
  {
    inputs: [],
    name: 'PauseUntilMustBeInFuture',
    type: 'error',
  },
  {
    inputs: [],
    name: 'PausedExpected',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'validatorPubkey',
        type: 'bytes',
      },
      {
        internalType: 'uint256',
        name: 'depositAmount',
        type: 'uint256',
      },
    ],
    name: 'PredepositAmountInvalid',
    type: 'error',
  },
  {
    inputs: [],
    name: 'RefundFailed',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ResumedExpected',
    type: 'error',
  },
  {
    inputs: [],
    name: 'RootNotFound',
    type: 'error',
  },
  {
    inputs: [],
    name: 'SameDepositor',
    type: 'error',
  },
  {
    inputs: [],
    name: 'SameGuarantor',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'enum PredepositGuarantee.ValidatorStage',
        name: 'stage',
        type: 'uint8',
      },
    ],
    name: 'ValidatorNotDisproven',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'validatorPubkey',
        type: 'bytes',
      },
      {
        internalType: 'enum PredepositGuarantee.ValidatorStage',
        name: 'stage',
        type: 'uint8',
      },
    ],
    name: 'ValidatorNotNew',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'validatorPubkey',
        type: 'bytes',
      },
      {
        internalType: 'enum PredepositGuarantee.ValidatorStage',
        name: 'stage',
        type: 'uint8',
      },
    ],
    name: 'ValidatorNotPreDeposited',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'ValueNotMultipleOfPredepositAmount',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint8',
        name: 'version',
        type: 'uint8',
      },
    ],
    name: 'WithdrawalCredentialsInvalidVersion',
    type: 'error',
  },
  {
    inputs: [],
    name: 'WithdrawalCredentialsMatch',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'withdrawalCredentials',
        type: 'bytes32',
      },
    ],
    name: 'WithdrawalCredentialsMisformed',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'stakingVault',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'withdrawalCredentialsAddress',
        type: 'address',
      },
    ],
    name: 'WithdrawalCredentialsMismatch',
    type: 'error',
  },
  {
    inputs: [],
    name: 'WithdrawalFailed',
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
    name: 'ZeroPauseDuration',
    type: 'error',
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
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint128',
        name: 'total',
        type: 'uint128',
      },
      {
        indexed: false,
        internalType: 'uint128',
        name: 'locked',
        type: 'uint128',
      },
    ],
    name: 'BalanceCompensated',
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
        internalType: 'uint128',
        name: 'total',
        type: 'uint128',
      },
      {
        indexed: false,
        internalType: 'uint128',
        name: 'locked',
        type: 'uint128',
      },
    ],
    name: 'BalanceLocked',
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
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
    ],
    name: 'BalanceRefunded',
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
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'BalanceToppedUp',
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
        internalType: 'uint128',
        name: 'total',
        type: 'uint128',
      },
      {
        indexed: false,
        internalType: 'uint128',
        name: 'locked',
        type: 'uint128',
      },
    ],
    name: 'BalanceUnlocked',
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
    name: 'BalanceWithdrawn',
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
        internalType: 'address',
        name: 'newDepositor',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'prevDepositor',
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
        indexed: true,
        internalType: 'address',
        name: 'guarantor',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'nodeOperator',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'GuarantorRefundAdded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'guarantor',
        type: 'address',
      },
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
    name: 'GuarantorRefundClaimed',
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
        internalType: 'address',
        name: 'newGuarantor',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'prevGuarantor',
        type: 'address',
      },
    ],
    name: 'GuarantorSet',
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
        indexed: false,
        internalType: 'uint256',
        name: 'duration',
        type: 'uint256',
      },
    ],
    name: 'Paused',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [],
    name: 'Resumed',
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
        internalType: 'bytes',
        name: 'validatorPubkey',
        type: 'bytes',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'nodeOperator',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'stakingVault',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
    ],
    name: 'ValidatorCompensated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes',
        name: 'validatorPubkey',
        type: 'bytes',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'nodeOperator',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'stakingVault',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'invalidWithdrawalCredentials',
        type: 'bytes32',
      },
    ],
    name: 'ValidatorDisproven',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes',
        name: 'validatorPubkey',
        type: 'bytes',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'nodeOperator',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'stakingVault',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'withdrawalCredentials',
        type: 'bytes32',
      },
    ],
    name: 'ValidatorPreDeposited',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes',
        name: 'validatorPubkey',
        type: 'bytes',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'nodeOperator',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'stakingVault',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'withdrawalCredentials',
        type: 'bytes32',
      },
    ],
    name: 'ValidatorProven',
    type: 'event',
  },
  {
    inputs: [],
    name: 'BEACON_ROOTS',
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
    name: 'DEPOSIT_DOMAIN',
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
    name: 'GI_FIRST_VALIDATOR_CURR',
    outputs: [
      {
        internalType: 'GIndex',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'GI_FIRST_VALIDATOR_PREV',
    outputs: [
      {
        internalType: 'GIndex',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'GI_PUBKEY_WC_PARENT',
    outputs: [
      {
        internalType: 'GIndex',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'GI_STATE_ROOT',
    outputs: [
      {
        internalType: 'GIndex',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'MAX_SUPPORTED_WC_VERSION',
    outputs: [
      {
        internalType: 'uint8',
        name: '',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'MIN_SUPPORTED_WC_VERSION',
    outputs: [
      {
        internalType: 'uint8',
        name: '',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'PAUSE_INFINITELY',
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
    name: 'PAUSE_ROLE',
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
    name: 'PIVOT_SLOT',
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
    inputs: [],
    name: 'PREDEPOSIT_AMOUNT',
    outputs: [
      {
        internalType: 'uint128',
        name: '',
        type: 'uint128',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'RESUME_ROLE',
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
        internalType: 'address',
        name: '_recipient',
        type: 'address',
      },
    ],
    name: 'claimGuarantorRefund',
    outputs: [
      {
        internalType: 'uint256',
        name: 'claimedEther',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_guarantor',
        type: 'address',
      },
    ],
    name: 'claimableRefund',
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
        internalType: 'bytes',
        name: '_validatorPubkey',
        type: 'bytes',
      },
      {
        internalType: 'address',
        name: '_recipient',
        type: 'address',
      },
    ],
    name: 'compensateDisprovenPredeposit',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IStakingVault',
        name: '_stakingVault',
        type: 'address',
      },
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
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getResumeSinceTimestamp',
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
        name: '_defaultAdmin',
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
    name: 'isPaused',
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
        name: '_nodeOperator',
        type: 'address',
      },
    ],
    name: 'nodeOperatorBalance',
    outputs: [
      {
        components: [
          {
            internalType: 'uint128',
            name: 'total',
            type: 'uint128',
          },
          {
            internalType: 'uint128',
            name: 'locked',
            type: 'uint128',
          },
        ],
        internalType: 'struct PredepositGuarantee.NodeOperatorBalance',
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
        internalType: 'address',
        name: '_nodeOperator',
        type: 'address',
      },
    ],
    name: 'nodeOperatorDepositor',
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
        internalType: 'address',
        name: '_nodeOperator',
        type: 'address',
      },
    ],
    name: 'nodeOperatorGuarantor',
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
        internalType: 'uint256',
        name: '_duration',
        type: 'uint256',
      },
    ],
    name: 'pauseFor',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_pauseUntilInclusive',
        type: 'uint256',
      },
    ],
    name: 'pauseUntil',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IStakingVault',
        name: '_stakingVault',
        type: 'address',
      },
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
      {
        components: [
          {
            components: [
              {
                internalType: 'bytes32',
                name: 'a',
                type: 'bytes32',
              },
              {
                internalType: 'bytes32',
                name: 'b',
                type: 'bytes32',
              },
            ],
            internalType: 'struct BLS12_381.Fp',
            name: 'pubkeyY',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'bytes32',
                name: 'c0_a',
                type: 'bytes32',
              },
              {
                internalType: 'bytes32',
                name: 'c0_b',
                type: 'bytes32',
              },
              {
                internalType: 'bytes32',
                name: 'c1_a',
                type: 'bytes32',
              },
              {
                internalType: 'bytes32',
                name: 'c1_b',
                type: 'bytes32',
              },
            ],
            internalType: 'struct BLS12_381.Fp2',
            name: 'signatureY',
            type: 'tuple',
          },
        ],
        internalType: 'struct BLS12_381.DepositY[]',
        name: '_depositsY',
        type: 'tuple[]',
      },
    ],
    name: 'predeposit',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'bytes32[]',
            name: 'proof',
            type: 'bytes32[]',
          },
          {
            internalType: 'bytes',
            name: 'pubkey',
            type: 'bytes',
          },
          {
            internalType: 'uint256',
            name: 'validatorIndex',
            type: 'uint256',
          },
          {
            internalType: 'uint64',
            name: 'childBlockTimestamp',
            type: 'uint64',
          },
          {
            internalType: 'uint64',
            name: 'slot',
            type: 'uint64',
          },
          {
            internalType: 'uint64',
            name: 'proposerIndex',
            type: 'uint64',
          },
        ],
        internalType: 'struct IPredepositGuarantee.ValidatorWitness[]',
        name: '_witnesses',
        type: 'tuple[]',
      },
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
      {
        internalType: 'contract IStakingVault',
        name: '_stakingVault',
        type: 'address',
      },
    ],
    name: 'proveAndDeposit',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'bytes32[]',
            name: 'proof',
            type: 'bytes32[]',
          },
          {
            internalType: 'bytes',
            name: 'pubkey',
            type: 'bytes',
          },
          {
            internalType: 'uint256',
            name: 'validatorIndex',
            type: 'uint256',
          },
          {
            internalType: 'uint64',
            name: 'childBlockTimestamp',
            type: 'uint64',
          },
          {
            internalType: 'uint64',
            name: 'slot',
            type: 'uint64',
          },
          {
            internalType: 'uint64',
            name: 'proposerIndex',
            type: 'uint64',
          },
        ],
        internalType: 'struct IPredepositGuarantee.ValidatorWitness',
        name: '_witness',
        type: 'tuple',
      },
      {
        internalType: 'bytes32',
        name: '_invalidWithdrawalCredentials',
        type: 'bytes32',
      },
    ],
    name: 'proveInvalidValidatorWC',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'bytes32[]',
            name: 'proof',
            type: 'bytes32[]',
          },
          {
            internalType: 'bytes',
            name: 'pubkey',
            type: 'bytes',
          },
          {
            internalType: 'uint256',
            name: 'validatorIndex',
            type: 'uint256',
          },
          {
            internalType: 'uint64',
            name: 'childBlockTimestamp',
            type: 'uint64',
          },
          {
            internalType: 'uint64',
            name: 'slot',
            type: 'uint64',
          },
          {
            internalType: 'uint64',
            name: 'proposerIndex',
            type: 'uint64',
          },
        ],
        internalType: 'struct IPredepositGuarantee.ValidatorWitness',
        name: '_witness',
        type: 'tuple',
      },
      {
        internalType: 'contract IStakingVault',
        name: '_stakingVault',
        type: 'address',
      },
    ],
    name: 'proveUnknownValidator',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'bytes32[]',
            name: 'proof',
            type: 'bytes32[]',
          },
          {
            internalType: 'bytes',
            name: 'pubkey',
            type: 'bytes',
          },
          {
            internalType: 'uint256',
            name: 'validatorIndex',
            type: 'uint256',
          },
          {
            internalType: 'uint64',
            name: 'childBlockTimestamp',
            type: 'uint64',
          },
          {
            internalType: 'uint64',
            name: 'slot',
            type: 'uint64',
          },
          {
            internalType: 'uint64',
            name: 'proposerIndex',
            type: 'uint64',
          },
        ],
        internalType: 'struct IPredepositGuarantee.ValidatorWitness',
        name: '_witness',
        type: 'tuple',
      },
    ],
    name: 'proveValidatorWC',
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
    inputs: [],
    name: 'resume',
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
        internalType: 'address',
        name: '_newDepositor',
        type: 'address',
      },
    ],
    name: 'setNodeOperatorDepositor',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_newGuarantor',
        type: 'address',
      },
    ],
    name: 'setNodeOperatorGuarantor',
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
        internalType: 'address',
        name: '_nodeOperator',
        type: 'address',
      },
    ],
    name: 'topUpNodeOperatorBalance',
    outputs: [],
    stateMutability: 'payable',
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
    name: 'unlockedBalance',
    outputs: [
      {
        internalType: 'uint256',
        name: 'unlocked',
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
            internalType: 'bytes32[]',
            name: 'proof',
            type: 'bytes32[]',
          },
          {
            internalType: 'bytes',
            name: 'pubkey',
            type: 'bytes',
          },
          {
            internalType: 'uint256',
            name: 'validatorIndex',
            type: 'uint256',
          },
          {
            internalType: 'uint64',
            name: 'childBlockTimestamp',
            type: 'uint64',
          },
          {
            internalType: 'uint64',
            name: 'slot',
            type: 'uint64',
          },
          {
            internalType: 'uint64',
            name: 'proposerIndex',
            type: 'uint64',
          },
        ],
        internalType: 'struct IPredepositGuarantee.ValidatorWitness',
        name: '_witness',
        type: 'tuple',
      },
      {
        internalType: 'bytes32',
        name: '_withdrawalCredentials',
        type: 'bytes32',
      },
    ],
    name: 'validatePubKeyWCProof',
    outputs: [],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: '_validatorPubkey',
        type: 'bytes',
      },
    ],
    name: 'validatorStatus',
    outputs: [
      {
        components: [
          {
            internalType: 'enum PredepositGuarantee.ValidatorStage',
            name: 'stage',
            type: 'uint8',
          },
          {
            internalType: 'contract IStakingVault',
            name: 'stakingVault',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'nodeOperator',
            type: 'address',
          },
        ],
        internalType: 'struct PredepositGuarantee.ValidatorStatus',
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
        internalType: 'struct IStakingVault.Deposit',
        name: '_deposit',
        type: 'tuple',
      },
      {
        components: [
          {
            components: [
              {
                internalType: 'bytes32',
                name: 'a',
                type: 'bytes32',
              },
              {
                internalType: 'bytes32',
                name: 'b',
                type: 'bytes32',
              },
            ],
            internalType: 'struct BLS12_381.Fp',
            name: 'pubkeyY',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'bytes32',
                name: 'c0_a',
                type: 'bytes32',
              },
              {
                internalType: 'bytes32',
                name: 'c0_b',
                type: 'bytes32',
              },
              {
                internalType: 'bytes32',
                name: 'c1_a',
                type: 'bytes32',
              },
              {
                internalType: 'bytes32',
                name: 'c1_b',
                type: 'bytes32',
              },
            ],
            internalType: 'struct BLS12_381.Fp2',
            name: 'signatureY',
            type: 'tuple',
          },
        ],
        internalType: 'struct BLS12_381.DepositY',
        name: '_depositsY',
        type: 'tuple',
      },
      {
        internalType: 'bytes32',
        name: '_withdrawalCredentials',
        type: 'bytes32',
      },
    ],
    name: 'verifyDepositMessage',
    outputs: [],
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
        name: '_amount',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_recipient',
        type: 'address',
      },
    ],
    name: 'withdrawNodeOperatorBalance',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

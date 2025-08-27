import { keccak256, toHex, zeroHash } from 'viem';

const toRoleHash = (role: string) => keccak256(toHex(role));

// Mapping of role names to their contract hashes

export const VAULTS_ROOT_ROLES_MAP = {
  defaultAdmin: zeroHash,
  nodeOperatorManager: toRoleHash(
    'vaults.NodeOperatorFee.NodeOperatorManagerRole',
  ),
} as const;

export const VAULTS_OWNER_ROLES_MAP = {
  supplier: toRoleHash('vaults.Permissions.Fund'),
  withdrawer: toRoleHash('vaults.Permissions.Withdraw'),
  minter: toRoleHash('vaults.Permissions.Mint'),
  repayer: toRoleHash('vaults.Permissions.Burn'),
  rebalancer: toRoleHash('vaults.Permissions.Rebalance'),
  depositsPauser: toRoleHash('vaults.Permissions.PauseDeposits'),
  depositsResumer: toRoleHash('vaults.Permissions.ResumeDeposits'),
  validatorExitRequester: toRoleHash('vaults.Permissions.RequestValidatorExit'),
  validatorWithdrawalTrigger: toRoleHash(
    'vaults.Permissions.TriggerValidatorWithdrawal',
  ),
  volunataryDisconnecter: toRoleHash('vaults.Permissions.VoluntaryDisconnect'),
  pdgCompensater: toRoleHash('vaults.Permissions.PDGCompensatePredeposit'),
  pdgProver: toRoleHash('vaults.Permissions.PDGProveValidator'),
  unguaranteedDepositor: toRoleHash(
    'vaults.Permissions.UnguaranteedBeaconChainDeposit',
  ),
  tierChangeRequester: toRoleHash('vaults.Permissions.ChangeTier'),
  assetRecoverer: toRoleHash('vaults.Dashboard.RecoverAssets'),
} as const;

export const VAULTS_NO_ROLES_MAP = {
  nodeOperatorRewardsAdjuster: toRoleHash(
    'vaults.NodeOperatorFee.RewardsAdjustRole',
  ),
} as const;

export const VAULTS_ALL_ROLES_MAP = {
  ...VAULTS_ROOT_ROLES_MAP,
  ...VAULTS_OWNER_ROLES_MAP,
  ...VAULTS_NO_ROLES_MAP,
} as const;

// Typings

export type VAULT_OWNER_ROLES = keyof typeof VAULTS_OWNER_ROLES_MAP;

export type VAULTS_NO_ROLES = keyof typeof VAULTS_NO_ROLES_MAP;

export type VAULT_ROOT_ROLES = keyof typeof VAULTS_ROOT_ROLES_MAP;

export type VAULTS_ALL_ROLES = keyof typeof VAULTS_ALL_ROLES_MAP;

// Ordered lists for display in UI

export const VAULT_MANAGER_PERMISSIONS_LIST: VAULT_OWNER_ROLES[] = [
  'supplier',
  'withdrawer',
  'minter',
  'repayer',
  'depositsPauser',
  'depositsResumer',
  'validatorWithdrawalTrigger',
  'validatorExitRequester',
  'rebalancer',
  'volunataryDisconnecter',
  'assetRecoverer',
  'pdgCompensater',
  'pdgProver',
  'unguaranteedDepositor',
  'tierChangeRequester',
] as const;

export const NO_MANAGER_PERMISSION_LIST: VAULTS_NO_ROLES[] = [
  'nodeOperatorRewardsAdjuster',
] as const;

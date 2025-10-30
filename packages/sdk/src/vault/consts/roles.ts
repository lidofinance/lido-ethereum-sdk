import { Hash, keccak256, toHex } from 'viem';

const toRoleHash = (role: string) => keccak256(toHex(role));

export const RECOVER_ASSETS_ROLE = toRoleHash('vaults.Dashboard.RecoverAssets');
export const VAULT_MASTER_ROLE = toRoleHash('vaults.VaultHub.VaultMasterRole');
export const VAULT_CODEHASH_SET_ROLE = toRoleHash(
  'vaults.VaultHub.VaultCodehashSetRole',
);
export const REDEMPTION_MASTER_ROLE = toRoleHash(
  'vaults.VaultHub.RedemptionMasterRole',
);
export const VALIDATOR_EXIT_ROLE = toRoleHash(
  'vaults.VaultHub.ValidatorExitRole',
);
export const BAD_DEBT_MASTER_ROLE = toRoleHash(
  'vaults.VaultHub.BadDebtMasterRole',
);
export const REGISTRY_ROLE = toRoleHash('vaults.OperatorsGrid.Registry');
export const FUND_ROLE = toRoleHash('vaults.Permissions.Fund');
export const WITHDRAW_ROLE = toRoleHash('vaults.Permissions.Withdraw');
export const MINT_ROLE = toRoleHash('vaults.Permissions.Mint');
export const BURN_ROLE = toRoleHash('vaults.Permissions.Burn');
export const REBALANCE_ROLE = toRoleHash('vaults.Permissions.Rebalance');
export const PAUSE_BEACON_CHAIN_DEPOSITS_ROLE = toRoleHash(
  'vaults.Permissions.PauseDeposits',
);
export const RESUME_BEACON_CHAIN_DEPOSITS_ROLE = toRoleHash(
  'vaults.Permissions.ResumeDeposits',
);
export const REQUEST_VALIDATOR_EXIT_ROLE = toRoleHash(
  'vaults.Permissions.RequestValidatorExit',
);
export const VOLUNTARY_DISCONNECT_ROLE = toRoleHash(
  'vaults.Permissions.VoluntaryDisconnect',
);
export const PDG_COMPENSATE_PREDEPOSIT_ROLE = toRoleHash(
  'vaults.Permissions.PDGCompensatePredeposit',
);
export const PDG_PROVE_VALIDATOR_ROLE = toRoleHash(
  'vaults.Permissions.PDGProveValidator',
);
export const CHANGE_TIER_ROLE = toRoleHash('vaults.Permissions.ChangeTier');
export const NODE_OPERATOR_MANAGER_ROLE = toRoleHash(
  'vaults.NodeOperatorFee.NodeOperatorManagerRole',
);
export const NODE_OPERATOR_REWARDS_ADJUST_ROLE = toRoleHash(
  'vaults.NodeOperatorFee.RewardsAdjustRole',
);

export const roleHashesSet = new Set([
  RECOVER_ASSETS_ROLE,
  VAULT_MASTER_ROLE,
  VAULT_CODEHASH_SET_ROLE,
  REDEMPTION_MASTER_ROLE,
  VALIDATOR_EXIT_ROLE,
  BAD_DEBT_MASTER_ROLE,
  REGISTRY_ROLE,
  FUND_ROLE,
  WITHDRAW_ROLE,
  MINT_ROLE,
  BURN_ROLE,
  REBALANCE_ROLE,
  PAUSE_BEACON_CHAIN_DEPOSITS_ROLE,
  RESUME_BEACON_CHAIN_DEPOSITS_ROLE,
  REQUEST_VALIDATOR_EXIT_ROLE,
  VOLUNTARY_DISCONNECT_ROLE,
  PDG_COMPENSATE_PREDEPOSIT_ROLE,
  PDG_PROVE_VALIDATOR_ROLE,
  CHANGE_TIER_ROLE,
  NODE_OPERATOR_MANAGER_ROLE,
  NODE_OPERATOR_REWARDS_ADJUST_ROLE,
]);

export const validateRole = (role: Hash) => {
  return roleHashesSet.has(role);
};

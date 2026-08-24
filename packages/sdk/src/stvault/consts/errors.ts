/**
 * Specific failure conditions the stVault module reports through
 * `SDKError.reason`. `SDKError.code` stays a broad category, so these are what
 * a consumer switches on to tell one condition from another — e.g. to pick the
 * right message or UI for a Dashboard that failed verification.
 */
export const VAULT_ERROR_REASON = {
  /**
   * The vault's owner is not a Dashboard contract: its bytecode does not match
   * the canonical Dashboard clone proxy.
   */
  OWNER_NOT_DASHBOARD: 'OWNER_NOT_DASHBOARD',
  /**
   * The address is a Dashboard, but its `stakingVault()` points at a different
   * vault, so it does not control this one.
   */
  DASHBOARD_NOT_BELONG_TO_VAULT: 'DASHBOARD_NOT_BELONG_TO_VAULT',
} as const;

export type VaultErrorReason =
  (typeof VAULT_ERROR_REASON)[keyof typeof VAULT_ERROR_REASON];

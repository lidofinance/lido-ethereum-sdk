export type SignallingEscrowDetails = {
  totalStETHLockedShares: bigint;
  totalStETHClaimedETH: bigint;
  totalUnstETHUnfinalizedShares: bigint;
  totalUnstETHFinalizedETH: bigint;
};

export type DualGovernanceConfig = {
  firstSealRageQuitSupport: bigint;
  secondSealRageQuitSupport: bigint;
  minAssetsLockDuration: number;
  vetoSignallingMinDuration: number;
  vetoSignallingMaxDuration: number;
  vetoSignallingMinActiveDuration: number;
  vetoSignallingDeactivationMaxDuration: number;
  vetoCooldownDuration: number;
  rageQuitExtensionPeriodDuration: number;
  rageQuitEthWithdrawalsMinDelay: number;
  rageQuitEthWithdrawalsMaxDelay: number;
  rageQuitEthWithdrawalsDelayGrowth: number;
};

export type DualGovernanceState = {
  effectiveState: number;
  persistedState: number;
  persistedStateEnteredAt: number;
  vetoSignallingActivatedAt: number;
  vetoSignallingReactivationTime: number;
  normalOrVetoCooldownExitedAt: number;
  rageQuitRound: bigint;
  vetoSignallingDuration: number;
};

export enum GovernanceState {
  NotInitialized,
  Normal,
  VetoSignalling,
  VetoSignallingDeactivation,
  VetoCooldown,
  RageQuit,
}

export type GetGovernanceWarningStatusProps = {
  triggerPercent: number;
}

export type GetGovernanceWarningStatusReturnType = {
  state: 'Blocked' | 'Warning' | 'Normal'
  currentVetoSupportPercent: number | null;
} | undefined;


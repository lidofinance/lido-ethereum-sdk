import type { GetContractReturnType } from 'viem';
import type { EncodableContract } from '../common/index.js';
import type { LidoSdkKeyedClients } from '../core/index.js';

import type { dualGovernanceAbiType } from './abi/DualGovernance.js';
import type { emergencyProtectedTimelockAbiType } from './abi/EmergencyProtectedTimelock.js';
import type { escrowAbiType } from './abi/Escrow.js';
import type { dgConfigProviderAbiType } from './abi/DGConfigProvider.js';

export type EmergencyProtectedTimelockContractType = EncodableContract<
  GetContractReturnType<emergencyProtectedTimelockAbiType, LidoSdkKeyedClients>
>;

export type DualGovernanceContractType = EncodableContract<
  GetContractReturnType<dualGovernanceAbiType, LidoSdkKeyedClients>
>;

export type EscrowContractType = EncodableContract<
  GetContractReturnType<escrowAbiType, LidoSdkKeyedClients>
>;

export type DGConfigProviderContractType = EncodableContract<
  GetContractReturnType<dgConfigProviderAbiType, LidoSdkKeyedClients>
>;

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
};

export type GetGovernanceWarningStatusReturnType = {
  state: 'Blocked' | 'Warning' | 'Normal' | 'Unknown';
  currentVetoSupportPercent: number | null;
};

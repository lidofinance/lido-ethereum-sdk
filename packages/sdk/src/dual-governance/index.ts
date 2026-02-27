// Module
export { LidoSDKDualGovernance } from './dual-governance.js';

// ABIs
export { escrowAbi } from './abi/Escrow.js';
export { emergencyProtectedTimelockAbi } from './abi/EmergencyProtectedTimelock.js';
export { dgConfigProviderAbi } from './abi/DGConfigProvider.js';
export { dualGovernanceAbi } from './abi/DualGovernance.js';

// Types

// ABIs types
export type { escrowAbiType } from './abi/Escrow.js';
export type { emergencyProtectedTimelockAbiType } from './abi/EmergencyProtectedTimelock.js';
export type { dgConfigProviderAbiType } from './abi/DGConfigProvider.js';
export type { dualGovernanceAbiType } from './abi/DualGovernance.js';

export type {
  // States
  GovernanceState,
  GetGovernanceWarningStatusProps,
  GetGovernanceWarningStatusReturnType,
  DualGovernanceState,
  SignallingEscrowDetails,
  DualGovernanceConfig,
  // Contracts
  EmergencyProtectedTimelockContractType,
  DGConfigProviderContractType,
  DualGovernanceContractType,
  EscrowContractType,
} from './types.js';

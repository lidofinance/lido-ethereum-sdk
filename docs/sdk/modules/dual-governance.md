# Dual Governance
The Dual Governance module provides an interface to interact with Lido's Dual Governance system, which implements a governance mechanism with veto signaling and rage quit capabilities. This module allows applications to query the current state of governance, monitor veto signaling thresholds, and interact with the relevant contracts.

[Specification](https://github.com/lidofinance/dual-governance/blob/main/docs/specification.md)

## Core Contracts

1. [**EmergencyProtectedTimelock**](https://github.com/lidofinance/dual-governance/blob/main/docs/specification.md#contract-emergencyprotectedtimelock): A timelock contract with emergency protection mechanisms.
2. [**DualGovernance**](https://github.com/lidofinance/dual-governance/blob/main/docs/specification.md#contract-dualgovernance): The main governance contract that manages the governance state.
3. [**VetoSignallingEscrow**](https://github.com/lidofinance/dual-governance/blob/main/docs/specification.md#contract-escrow): Manages stETH deposits used for veto signaling.
4. **stETH**: The Lido staked ETH token contract.
5. [**DualGovernanceConfigProvider**](https://github.com/lidofinance/dual-governance/blob/main/docs/specification.md#contract-immutabledualgovernanceconfigprovider): Provides configuration parameters for the dual governance system.

## Governance States

The Dual Governance system can be in one of the following states:

- **NotInitialized**: Initial state before the governance system is activated.
- **Normal**: Regular operation state.
- **VetoSignalling**: Active veto signaling period.
- **VetoSignallingDeactivation**: Period when veto signaling is being deactivated.
- **VetoCooldown**: Cooldown period after veto signaling.
- **RageQuit**: State when rage quit is active, allowing users to withdraw their assets.

## API Reference

### Contract Access Methods

- `getContractEmergencyProtectedTimelockAddress()`:  Returns the address of the `EmergencyProtectedTimelock contract`.
- `getContractEmergencyProtectedTimelock()`: Returns the `EmergencyProtectedTimelock` contract instance.
- `getContractDualGovernance()`: Returns the `DualGovernance` contract instance.
- `getContractVetoSignallingEscrow()`: Returns the `VetoSignallingEscrow` contract instance.
- `getContractStETH()`: Returns the `stETH` contract instance.
- `getContractDualGovernanceConfigProvider()`: Returns the `DualGovernanceConfigProvider` contract instance.

### Contract Address Methods

- [`getGovernanceAddress()`](https://github.com/lidofinance/dual-governance/blob/main/docs/specification.md#function-emergencyprotectedtimelockgetgovernance): Returns the address of the DualGovernance contract.
- `getVetoSignallingEscrowAddress()]: Returns the address of the `VetoSignallingEscrow` contract.
- `getStETHAddress()`: Returns the address of the `stETH` contract.
- [`getDualGovernanceConfigProviderAddress()`](https://github.com/lidofinance/dual-governance/blob/main/docs/specification.md#function-dualgovernancegetconfigprovider): Returns the address of the DualGovernanceConfigProvider contract.

### Data Query Methods

- `getVetoSignallingEscrowLockedAssets()`: Returns details about assets locked in the `VetoSignallingEscrow` contract.
- `getTotalStEthInEscrow()`: Calculates the total amount of stETH (in ETH terms) locked in the `VetoSignallingEscrow`.
- `getDualGovernanceConfig()`: Returns the configuration parameters of the dual governance system.
- `getTotalStETHSupply()`: Returns the total supply of stETH tokens.
- `calculateCurrentVetoSignallingThresholdProgress()`:  Calculates the current progress towards the veto signaling threshold as a percentage.
- [`getDualGovernanceState()`](https://github.com/lidofinance/dual-governance/blob/main/docs/specification.md#governance-state): Returns the current persisted state of the dual governance system.
- `getGovernanceWarningStatus()`: Computes the current governance status and returns a warning level based on the provided trigger percentage.

## Usage Examples

```ts

import { LidoSDK } from '@lidofinance/lido-ethereum-sdk';

const lidoSDK = new LidoSDK();
const dualGovernance = lidoSDK.dualGovernance;

// Get the current veto signaling progress
const progress = await dualGovernance.calculateCurrentVetoSignallingThresholdProgress();
console.log(`Current veto signaling support: ${progress.currentSupportPercent}%`);

// Check if we should show a warning (e.g., if support is above 75%)
const warningStatus = await dualGovernance.getGovernanceWarningStatus({
  triggerPercent: 75
});

if (warningStatus.state === 'Warning') {
  console.log(`Warning: Veto support at ${warningStatus.currentVetoSupportPercent}%`);
} else if (warningStatus.state === 'Blocked') {
  console.log('Governance is currently blocked (in VetoSignalling, VetoSignallingDeactivation, or RageQuit state)');
}

```

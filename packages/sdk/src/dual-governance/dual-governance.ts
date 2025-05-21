import { LidoSDKModule } from '../common/class-primitives/sdk-module.js';
import {
  Address,
  getContract,
  formatUnits,
  type GetContractReturnType,
  type PublicClient,
} from 'viem';
import { emergencyProtectedTimelockAbi } from './abi/EmergencyProtectedTimelock.js';
import {
  CHAINS,
  EMERGENCY_PROTECTED_TIMELOCK_ADDRESSES,
  ERROR_CODE,
  invariant,
} from '../common/index.js';
import { dualGovernanceAbi } from './abi/DualGovernance.js';
import { escrow } from './abi/Escrow.js';
import {
  DualGovernanceConfig,
  DualGovernanceState, GetGovernanceWarningStatusProps, GetGovernanceWarningStatusReturnType, GovernanceState,
  SignallingEscrowDetails,
} from './types.js';
import { stETH } from './abi/StETH.js';
import { dgConfigProviderAbi } from './abi/DGConfigProvider.js';
import { Cache } from '../common/decorators/index.js';

export class LidoSDKDualGovernance extends LidoSDKModule {
  // ---- Contract Addresses ----

  @Cache(30 * 60 * 1000, ['core.chain.id'])
  public async getGovernanceAddress(): Promise<Address | undefined> {
    const emergencyProtectedTimelockContract =
      await this.getContractEmergencyProtectedTimelock();

    invariant(
      emergencyProtectedTimelockContract,
      `Couldn't get emergencyProtectedTimelockContract on chain ${this.core.chain.name}`,
      ERROR_CODE.READ_ERROR,
    );

    try {
      return await emergencyProtectedTimelockContract.read.getGovernance();
    } catch (error) {
      return undefined;
    }
  }

  @Cache(30 * 60 * 1000, ['core.chain.id'])
  public async getVetoSignallingEscrowAddress(): Promise<Address | undefined> {
    const dualGovernanceContract = await this.getContractDualGovernance();

    invariant(
      dualGovernanceContract,
      `Couldn't get dualGovernanceContract on chain ${this.core.chain.name}`,
      ERROR_CODE.READ_ERROR,
    );

    try {
      return await dualGovernanceContract.read.getVetoSignallingEscrow();
    } catch (error) {
      return undefined;
    }
  }

  @Cache(30 * 60 * 1000, ['core.chain.id'])
  public async getStETHAddress(): Promise<Address | undefined> {
    const vetoSignallingContract = await this.getContractVetoSignallingEscrow();

    invariant(
      vetoSignallingContract,
      `Couldn't get vetoSignallingContract on chain ${this.core.chain.name}`,
      ERROR_CODE.READ_ERROR,
    );

    try {
      return await vetoSignallingContract.read.ST_ETH();
    } catch (error) {
      return undefined;
    }
  }

  @Cache(30 * 60 * 1000, ['core.chain.id'])
  public async getDualGovernanceConfigProviderAddress(): Promise<
    Address | undefined
  > {
    const dualGovernanceContract = await this.getContractDualGovernance();

    invariant(
      dualGovernanceContract,
      `Couldn't get dualGovernanceContract on chain ${this.core.chain.name}`,
      ERROR_CODE.READ_ERROR,
    );

    try {
      return await dualGovernanceContract.read.getConfigProvider();
    } catch (error) {
      return undefined;
    }
  }

  // ---- Contracts ----
  @Cache(30 * 60 * 1000, ['core.chain.id'])
  public async getContractEmergencyProtectedTimelock(): Promise<
    GetContractReturnType<typeof emergencyProtectedTimelockAbi, PublicClient>
  > {
    const address =
      EMERGENCY_PROTECTED_TIMELOCK_ADDRESSES[this.core.chain.id as CHAINS];

    invariant(
      address,
      `EmergencyProtectedTimelock is not supported on  ${this.core.chain.name}`,
      ERROR_CODE.NOT_SUPPORTED,
    );

    return getContract({
      address,
      abi: emergencyProtectedTimelockAbi,
      client: this.core.rpcProvider,
    });
  }

  @Cache(30 * 60 * 1000, ['core.chain.id'])
  public async getContractDualGovernance(): Promise<
    GetContractReturnType<typeof dualGovernanceAbi, PublicClient>
  > {
    const address = await this.getGovernanceAddress();

    invariant(
      address,
      `Couldn't fetch DualGovernance address on chain ${this.core.chain.name}`,
      ERROR_CODE.READ_ERROR,
    );

    return getContract({
      address,
      abi: dualGovernanceAbi,
      client: this.core.rpcProvider,
    });
  }

  @Cache(30 * 60 * 1000, ['core.chain.id'])
  public async getContractVetoSignallingEscrow(): Promise<
    GetContractReturnType<typeof escrow, PublicClient>
  > {
    const address = await this.getVetoSignallingEscrowAddress();

    invariant(
      address,
      `Couldn't fetch VetoSignallingEscrow address on chain ${this.core.chain.name}`,
      ERROR_CODE.READ_ERROR,
    );

    return getContract({
      address,
      abi: escrow,
      client: this.core.rpcProvider,
    });
  }

  @Cache(30 * 60 * 1000, ['core.chain.id'])
  public async getContractStETH(): Promise<
    GetContractReturnType<typeof stETH, PublicClient>
  > {
    const address = await this.getStETHAddress();

    invariant(
      address,
      `Couldn't fetch stETH address on chain ${this.core.chain.name}`,
      ERROR_CODE.READ_ERROR,
    );

    return getContract({
      address,
      abi: stETH,
      client: this.core.rpcProvider,
    });
  }

  @Cache(30 * 60 * 1000, ['core.chain.id'])
  public async getContractDualGovernanceConfigProvider(): Promise<
    GetContractReturnType<typeof dgConfigProviderAbi, PublicClient>
  > {
    const address = await this.getDualGovernanceConfigProviderAddress();

    invariant(
      address,
      `Couldn't fetch DualGovernanceConfigProvider address on chain ${this.core.chain.name}`,
      ERROR_CODE.READ_ERROR,
    );

    return getContract({
      address,
      abi: dgConfigProviderAbi,
      client: this.core.rpcProvider,
    });
  }

  // ---- Data Preparation ----

  public async getVetoSignallingEscrowLockedAssets(): Promise<
    SignallingEscrowDetails | undefined
  > {
    const vetoSignallingContract = await this.getContractVetoSignallingEscrow();

    invariant(
      vetoSignallingContract,
      `Couldn't get vetoSignallingContract on chain ${this.core.chain.name}`,
      ERROR_CODE.READ_ERROR,
    );

    try {
      return await vetoSignallingContract.read.getSignallingEscrowDetails();
    } catch (error) {
      return undefined;
    }
  }

  public async getTotalStEthInEscrow(): Promise<bigint | undefined> {
    const stETHContract = await this.getContractStETH();
    const vetoSignallingEscrowLockedAssets =
      await this.getVetoSignallingEscrowLockedAssets();

    invariant(
      stETHContract,
      `Couldn't get stETHContract on chain ${this.core.chain.name}`,
      ERROR_CODE.READ_ERROR,
    );

    invariant(
      vetoSignallingEscrowLockedAssets,
      `Couldn't get vetoSignallingEscrowLockedAssets on chain ${this.core.chain.name}`,
      ERROR_CODE.READ_ERROR,
    );

    const unfinalizedShares =
      vetoSignallingEscrowLockedAssets.totalStETHLockedShares +
      vetoSignallingEscrowLockedAssets.totalUnstETHUnfinalizedShares;

    try {
      const pooledEthByShares = await stETHContract.read.getPooledEthByShares([
        unfinalizedShares,
      ]);

      return (
        pooledEthByShares +
        vetoSignallingEscrowLockedAssets.totalUnstETHFinalizedETH
      );
    } catch (error) {
      return undefined;
    }
  }

  public async getDualGovernanceConfig(): Promise<
    DualGovernanceConfig | undefined
  > {
    const dualGovernanceConfigProviderContract =
      await this.getContractDualGovernanceConfigProvider();

    invariant(
      dualGovernanceConfigProviderContract,
      `Couldn't get dualGovernanceConfigProviderContract on chain ${this.core.chain.name}`,
      ERROR_CODE.READ_ERROR,
    );

    try {
      return await dualGovernanceConfigProviderContract.read.getDualGovernanceConfig();
    } catch (error) {
      return undefined;
    }
  }

  public async getTotalStETHSupply(): Promise<bigint | undefined> {
    const stETHContract = await this.getContractStETH();

    invariant(
      stETHContract,
      `Couldn't get stETHContract on chain ${this.core.chain.name}`,
      ERROR_CODE.READ_ERROR,
    );

    try {
      return await stETHContract.read.totalSupply();
    } catch (error) {
      return undefined;
    }
  }

  public async calculateCurrentVetoSignallingThresholdProgress(): Promise<
    | {
        currentSupportPercent: number;
      }
    | undefined
  > {
    const totalStETHSupply = await this.getTotalStETHSupply();
    const dualGovernanceConfig = await this.getDualGovernanceConfig();
    const totalStEthInEscrow = await this.getTotalStEthInEscrow();

    if (dualGovernanceConfig === undefined) {
      console.debug('dualGovernanceConfig is undefined!');
      return { currentSupportPercent: 0 };
    }

    if (totalStEthInEscrow === undefined) {
      console.debug('totalStEthInEscrow is undefined!',);
      return { currentSupportPercent: 0 };
    }

    if (totalStETHSupply === undefined) {
      console.debug('totalStETHSupply is undefined!');
      return { currentSupportPercent: 0 };
    }

    const targetPercent = Number(
      formatUnits(dualGovernanceConfig.firstSealRageQuitSupport, 16),
    );

    const currentSupport = totalStEthInEscrow;

    if (targetPercent < 0 || currentSupport < 0n || totalStETHSupply < 0n) {
      return { currentSupportPercent: 0 };
    }

    if (totalStETHSupply === 0n) {
      const percent = currentSupport > 0n ? 100 : 0;
      return { currentSupportPercent: percent };
    }

    const targetValue = (totalStETHSupply * BigInt(targetPercent)) / 100n;

    if (targetValue === 0n) {
      const percent = currentSupport > 0n ? 100 : 0;
      return { currentSupportPercent: percent };
    }

    const thresholdSupportPercentBigInt = (currentSupport * 100n) / targetValue;

    let thresholdSupportPercentNumber = Number(thresholdSupportPercentBigInt);

    if (thresholdSupportPercentNumber > 100) {
      thresholdSupportPercentNumber = 100;
    }

    if (thresholdSupportPercentNumber < 0) {
      thresholdSupportPercentNumber = 0;
    }

    return {
      currentSupportPercent: thresholdSupportPercentNumber,
    };
  }

  public async getDualGovernanceState(): Promise<
    DualGovernanceState['persistedState'] | undefined
  > {
    const dualGovernanceContract = await this.getContractDualGovernance();

    if (dualGovernanceContract === undefined) {
      console.debug('dualGovernance contract is undefined!');
      return undefined;
    }

    try {
      const dualGovernanceState =
        await dualGovernanceContract.read.getStateDetails();

      return dualGovernanceState.persistedState;
    } catch (error) {
      return undefined;
    }
  }

  public async getGovernanceWarningStatus({
    triggerPercent,
  }:  GetGovernanceWarningStatusProps): Promise<GetGovernanceWarningStatusReturnType> {
    const currentGovernanceState = await this.getDualGovernanceState();

    const NORMAL_STATES = [
      GovernanceState.NotInitialized,
      GovernanceState.Normal,
      GovernanceState.VetoCooldown
    ]

    const BLOCKED_STATES = [
      GovernanceState.VetoSignalling,
      GovernanceState.VetoSignallingDeactivation,
      GovernanceState.RageQuit,
    ]

    if (currentGovernanceState === undefined) {
      console.debug('dualGovernanceWarningStatus is undefined!');
      return undefined;
    }

    if (BLOCKED_STATES.includes(currentGovernanceState)) {
      return {
        state: 'Blocked',
        currentVetoSupportPercent: null,
      }
    }

    if (NORMAL_STATES.includes(currentGovernanceState)) {
      try {
        const response = await this.calculateCurrentVetoSignallingThresholdProgress()
        if (response) {
          const currentVetoPercent = response.currentSupportPercent

          if (currentVetoPercent > triggerPercent) {
            return {
              state: 'Warning',
              currentVetoSupportPercent: currentVetoPercent
            }
          } else {
            return {
              state: 'Normal',
              currentVetoSupportPercent: null,
            }
          }
        } else {
          console.debug(`Couldn't get current veto percent`)
          return undefined;
        }

      } catch (error) {
        console.debug(`Couldn't get Governance warning status`, error);
        return undefined
      }
    }

    return undefined;
  }
}

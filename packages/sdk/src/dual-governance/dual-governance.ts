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
import { Cache, ErrorHandler, Logger } from '../common/decorators/index.js';

export class LidoSDKDualGovernance extends LidoSDKModule {
  // ---- Contract Addresses ----

  @Cache(30 * 60 * 1000, ['core.chain.id'])
  @Logger('Views:')
  @ErrorHandler()
  public async getGovernanceAddress(): Promise<Address | undefined> {
    const emergencyProtectedTimelockContract =
      await this.getContractEmergencyProtectedTimelock();

    invariant(
      emergencyProtectedTimelockContract,
      `Couldn't get emergencyProtectedTimelockContract on chain ${this.core.chain.name}`,
      ERROR_CODE.READ_ERROR,
    );

    return await emergencyProtectedTimelockContract.read.getGovernance();
  }

  @Cache(30 * 60 * 1000, ['core.chain.id'])
  @Logger('Views:')
  @ErrorHandler()
  public async getVetoSignallingEscrowAddress(): Promise<Address | undefined> {
    const dualGovernanceContract = await this.getContractDualGovernance();

    invariant(
      dualGovernanceContract,
      `Couldn't get dualGovernanceContract on chain ${this.core.chain.name}`,
      ERROR_CODE.READ_ERROR,
    );

    return await dualGovernanceContract.read.getVetoSignallingEscrow();
  }

  @Cache(30 * 60 * 1000, ['core.chain.id'])
  @Logger('Views:')
  @ErrorHandler()
  public async getStETHAddress(): Promise<Address | undefined> {
    const vetoSignallingContract = await this.getContractVetoSignallingEscrow();

    invariant(
      vetoSignallingContract,
      `Couldn't get vetoSignallingContract on chain ${this.core.chain.name}`,
      ERROR_CODE.READ_ERROR,
    );

    return await vetoSignallingContract.read.ST_ETH();
  }

  @Cache(30 * 60 * 1000, ['core.chain.id'])
  @Logger('Views:')
  @ErrorHandler()
  public async getDualGovernanceConfigProviderAddress(): Promise<
    Address | undefined
  > {
    const dualGovernanceContract = await this.getContractDualGovernance();

    invariant(
      dualGovernanceContract,
      `Couldn't get dualGovernanceContract on chain ${this.core.chain.name}`,
      ERROR_CODE.READ_ERROR,
    );

    return await dualGovernanceContract.read.getConfigProvider();
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

  @Cache(30 * 60 * 1000, ['core.chain.id'])
  @Logger('Views:')
  @ErrorHandler()
  public async getVetoSignallingEscrowLockedAssets(): Promise<SignallingEscrowDetails> {
    const vetoSignallingContract = await this.getContractVetoSignallingEscrow();

    invariant(
      vetoSignallingContract,
      `Couldn't get vetoSignallingContract on chain ${this.core.chain.name}`,
      ERROR_CODE.READ_ERROR,
    );

    return await vetoSignallingContract.read.getSignallingEscrowDetails();
  }

  @Cache(30 * 60 * 1000, ['core.chain.id'])
  @Logger('Views:')
  @ErrorHandler()
  public async getTotalStEthInEscrow(): Promise<bigint> {
    const stETHContract = await this.getContractStETH();
    const vetoSignallingEscrowLockedAssets =
      await this.getVetoSignallingEscrowLockedAssets();

    invariant(
      stETHContract,
      `Couldn't get stETHContract on chain ${this.core.chain.name}`,
      ERROR_CODE.READ_ERROR,
    );

    const unfinalizedShares =
      vetoSignallingEscrowLockedAssets.totalStETHLockedShares +
      vetoSignallingEscrowLockedAssets.totalUnstETHUnfinalizedShares;

    const pooledEthByShares = await stETHContract.read.getPooledEthByShares([
      unfinalizedShares,
    ]);

    return (
      pooledEthByShares +
      vetoSignallingEscrowLockedAssets.totalUnstETHFinalizedETH
    );
  }

  @Cache(30 * 60 * 1000, ['core.chain.id'])
  @Logger('Views:')
  @ErrorHandler()
  public async getDualGovernanceConfig(): Promise<
    DualGovernanceConfig | undefined
  > {
    const dualGovernanceConfigProvider =
      await this.getContractDualGovernanceConfigProvider();

    invariant(
      dualGovernanceConfigProvider,
      `Couldn't get dualGovernanceConfigProvider on chain ${this.core.chain.name}`,
      ERROR_CODE.READ_ERROR,
    );

    return await dualGovernanceConfigProvider.read.getDualGovernanceConfig();
  }

  @Cache(30 * 60 * 1000, ['core.chain.id'])
  @Logger('Views:')
  @ErrorHandler()
  public async getTotalStETHSupply(): Promise<bigint | undefined> {
    const stETHContract = await this.getContractStETH();

    invariant(
      stETHContract,
      `Couldn't get stETHContract on chain ${this.core.chain.name}`,
      ERROR_CODE.READ_ERROR,
    );

    return await stETHContract.read.totalSupply();
  }

  @Cache(30 * 60 * 1000, ['core.chain.id'])
  @Logger('Views:')
  @ErrorHandler()
  public async calculateCurrentVetoSignallingThresholdProgress(): Promise<
    | {
        currentSupportPercent: number;
      }
    | undefined
  > {
    const [totalStETHSupply, dualGovernanceConfig, totalStEthInEscrow] = await Promise.all([
      this.getTotalStETHSupply(),
      this.getDualGovernanceConfig(),
      this.getTotalStEthInEscrow(),
    ])

    if (dualGovernanceConfig === undefined) {
      return { currentSupportPercent: 0 };
    }

    if (totalStEthInEscrow === undefined) {
      return { currentSupportPercent: 0 };
    }

    if (totalStETHSupply === undefined) {
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

  @Cache(30 * 60 * 1000, ['core.chain.id'])
  @Logger('Views:')
  @ErrorHandler()
  public async getDualGovernanceState(): Promise<
    DualGovernanceState['persistedState'] | undefined
  > {
    const dualGovernanceContract = await this.getContractDualGovernance();

    if (dualGovernanceContract === undefined) {
      return undefined;
    }

    const dualGovernanceState =
      await dualGovernanceContract.read.getStateDetails();

    return dualGovernanceState.persistedState;
  }

  @Cache(30 * 60 * 1000, ['core.chain.id', 'triggerPercent'])
  @Logger('Views:')
  @ErrorHandler()
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
      return undefined;
    }

    if (BLOCKED_STATES.includes(currentGovernanceState)) {
      return {
        state: 'Blocked',
        currentVetoSupportPercent: null,
      }
    }

    if (NORMAL_STATES.includes(currentGovernanceState)) {
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
        return undefined;
      }
    }

    return undefined;
  }
}

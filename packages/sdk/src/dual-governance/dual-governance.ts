import {
  formatUnits,
  getContract,
  type Address,
  type WalletClient,
  type GetContractReturnType,
} from 'viem';

import {
  DUAL_GOVERNANCE_CONTRACT_NAMES,
  ERROR_CODE,
  getEncodableContract,
  invariant,
  type EncodableContract,
} from '../common/index.js';
import { LidoSDKModule } from '../common/class-primitives/sdk-module.js';
import { Cache, Logger } from '../common/decorators/index.js';

import {
  dualGovernanceAbi,
  dualGovernanceAbiType,
} from './abi/DualGovernance.js';
import { escrowAbi, type escrowAbiType } from './abi/Escrow.js';
import {
  emergencyProtectedTimelockAbi,
  type emergencyProtectedTimelockAbiType,
} from './abi/EmergencyProtectedTimelock.js';
import {
  dgConfigProviderAbi,
  type dgConfigProviderAbiType,
} from './abi/DGConfigProvider.js';

import {
  DualGovernanceConfig,
  DualGovernanceState,
  GetGovernanceWarningStatusProps,
  GetGovernanceWarningStatusReturnType,
  GovernanceState,
  SignallingEscrowDetails,
} from './types.js';
import { LidoAbiType } from '../core/abi/lido.js';

export class LidoSDKDualGovernance extends LidoSDKModule {
  // Contracts Addresses
  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['core.chain.id'])
  public getContractEmergencyProtectedTimelockAddress(): Address {
    return this.core.getDualGovernanceContractAddress(
      DUAL_GOVERNANCE_CONTRACT_NAMES.EPT,
    );
  }

  // Contracts
  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['core.chain.id'])
  public async getContractEmergencyProtectedTimelock(): Promise<
    EncodableContract<
      GetContractReturnType<emergencyProtectedTimelockAbiType, WalletClient>
    >
  > {
    const address = this.getContractEmergencyProtectedTimelockAddress();

    invariant(
      address,
      `EmergencyProtectedTimelock is not supported on  ${this.core.chain.name}`,
      ERROR_CODE.NOT_SUPPORTED,
    );

    return getEncodableContract(
      getContract({
        address,
        abi: emergencyProtectedTimelockAbi,
        client: {
          public: this.core.rpcProvider,
          wallet: this.core.web3Provider as WalletClient,
        },
      }),
    );
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['core.chain.id'])
  public async getContractDualGovernance(): Promise<
    EncodableContract<
      GetContractReturnType<dualGovernanceAbiType, WalletClient>
    >
  > {
    const address = await this.getGovernanceAddress();

    invariant(
      address,
      `Couldn't fetch DualGovernance address on chain ${this.core.chain.name}`,
      ERROR_CODE.READ_ERROR,
    );

    return getEncodableContract(
      getContract({
        address,
        abi: dualGovernanceAbi,
        client: {
          public: this.core.rpcProvider,
          wallet: this.core.web3Provider as WalletClient,
        },
      }),
    );
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['core.chain.id'])
  public async getContractVetoSignallingEscrow(): Promise<
    EncodableContract<GetContractReturnType<escrowAbiType, WalletClient>>
  > {
    const address = await this.getVetoSignallingEscrowAddress();

    invariant(
      address,
      `Couldn't fetch VetoSignallingEscrow address on chain ${this.core.chain.name}`,
      ERROR_CODE.READ_ERROR,
    );

    return getEncodableContract(
      getContract({
        address,
        abi: escrowAbi,
        client: {
          public: this.core.rpcProvider,
          wallet: this.core.web3Provider as WalletClient,
        },
      }),
    );
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['core.chain.id'])
  public async getContractStETH(): Promise<
    EncodableContract<GetContractReturnType<LidoAbiType, WalletClient>>
  > {
    return this.core.getLidoContract();
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['core.chain.id'])
  public async getContractDualGovernanceConfigProvider(): Promise<
    EncodableContract<
      GetContractReturnType<dgConfigProviderAbiType, WalletClient>
    >
  > {
    const address = await this.getDualGovernanceConfigProviderAddress();

    invariant(
      address,
      `Couldn't fetch DualGovernanceConfigProvider address on chain ${this.core.chain.name}`,
      ERROR_CODE.READ_ERROR,
    );

    return getEncodableContract(
      getContract({
        address,
        abi: dgConfigProviderAbi,
        client: {
          public: this.core.rpcProvider,
          wallet: this.core.web3Provider as WalletClient,
        },
      }),
    );
  }

  // Views

  @Logger('Views:')
  @Cache(30 * 60 * 1000, ['core.chain.id'])
  public async getGovernanceAddress(): Promise<Address> {
    const emergencyProtectedTimelockContract =
      await this.getContractEmergencyProtectedTimelock();

    return await emergencyProtectedTimelockContract.read.getGovernance();
  }

  @Logger('Views:')
  @Cache(30 * 60 * 1000, ['core.chain.id'])
  public async getVetoSignallingEscrowAddress(): Promise<Address> {
    const dualGovernanceContract = await this.getContractDualGovernance();

    return await dualGovernanceContract.read.getVetoSignallingEscrow();
  }

  @Logger('Views:')
  @Cache(30 * 60 * 1000, ['core.chain.id'])
  public async getStETHAddress(): Promise<Address> {
    const vetoSignallingContract = await this.getContractVetoSignallingEscrow();

    return await vetoSignallingContract.read.ST_ETH();
  }

  @Logger('Views:')
  @Cache(30 * 60 * 1000, ['core.chain.id'])
  public async getDualGovernanceConfigProviderAddress(): Promise<Address> {
    const dualGovernanceContract = await this.getContractDualGovernance();

    return await dualGovernanceContract.read.getConfigProvider();
  }

  // Data Preparation

  @Logger('Views:')
  @Cache(30 * 60 * 1000, ['core.chain.id'])
  public async getVetoSignallingEscrowLockedAssets(): Promise<SignallingEscrowDetails> {
    const vetoSignallingContract = await this.getContractVetoSignallingEscrow();

    return await vetoSignallingContract.read.getSignallingEscrowDetails();
  }

  @Logger('Views:')
  @Cache(30 * 60 * 1000, ['core.chain.id'])
  public async getTotalStEthInEscrow(): Promise<bigint> {
    const stETHContract = await this.getContractStETH();
    const vetoSignallingEscrowLockedAssets =
      await this.getVetoSignallingEscrowLockedAssets();

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

  @Logger('Views:')
  @Cache(30 * 60 * 1000, ['core.chain.id'])
  public async getDualGovernanceConfig(): Promise<DualGovernanceConfig> {
    const dualGovernanceConfigProvider =
      await this.getContractDualGovernanceConfigProvider();

    return await dualGovernanceConfigProvider.read.getDualGovernanceConfig();
  }

  @Logger('Views:')
  @Cache(30 * 60 * 1000, ['core.chain.id'])
  public async getTotalStETHSupply(): Promise<bigint> {
    const stETHContract = await this.getContractStETH();

    return await stETHContract.read.totalSupply();
  }

  @Logger('Views:')
  @Cache(30 * 60 * 1000, ['core.chain.id'])
  public async calculateCurrentVetoSignallingThresholdProgress(): Promise<{
    currentSupportPercent: number;
  }> {
    const [totalStETHSupply, dualGovernanceConfig, totalStEthInEscrow] =
      await Promise.all([
        this.getTotalStETHSupply(),
        this.getDualGovernanceConfig(),
        this.getTotalStEthInEscrow(),
      ]);

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

    if (thresholdSupportPercentNumber > 100)
      thresholdSupportPercentNumber = 100;

    if (thresholdSupportPercentNumber < 0) thresholdSupportPercentNumber = 0;

    return {
      currentSupportPercent: thresholdSupportPercentNumber,
    };
  }

  @Logger('Views:')
  @Cache(30 * 60 * 1000, ['core.chain.id'])
  public async getDualGovernanceState(): Promise<
    DualGovernanceState['persistedState']
  > {
    const dualGovernanceContract = await this.getContractDualGovernance();

    const { persistedState } =
      await dualGovernanceContract.read.getStateDetails();

    return persistedState;
  }

  @Logger('Views:')
  @Cache(30 * 60 * 1000, ['core.chain.id', 'triggerPercent'])
  public async getGovernanceWarningStatus({
    triggerPercent,
  }: GetGovernanceWarningStatusProps): Promise<GetGovernanceWarningStatusReturnType> {
    const currentGovernanceState = await this.getDualGovernanceState();
    const { currentSupportPercent } =
      await this.calculateCurrentVetoSignallingThresholdProgress();

    const NORMAL_STATES = [
      GovernanceState.Normal,
      GovernanceState.VetoCooldown,
    ];
    const BLOCKED_STATES = [
      GovernanceState.VetoSignalling,
      GovernanceState.VetoSignallingDeactivation,
      GovernanceState.RageQuit,
    ];

    if (BLOCKED_STATES.includes(currentGovernanceState)) {
      return {
        state: 'Blocked',
        currentVetoSupportPercent: currentSupportPercent,
      };
    }

    if (NORMAL_STATES.includes(currentGovernanceState)) {
      if (currentSupportPercent > triggerPercent) {
        return {
          state: 'Warning',
          currentVetoSupportPercent: currentSupportPercent,
        };
      } else {
        return {
          state: 'Normal',
          currentVetoSupportPercent: currentSupportPercent,
        };
      }
    }

    return {
      state: 'Unknown',
      currentVetoSupportPercent: null,
    };
  }
}

import { getAbiItem, getContract, toEventHash, type Address } from 'viem';

import {
  DashboardAbi,
  DashboardCreatedEventAbi,
  OperatorGridAbi,
  PredepositGuaranteeAbi,
  StakingVaultAbi,
  VaultCreatedEventAbi,
  VaultFactoryAbi,
  VaultHubAbi,
  VaultViewerAbi,
  LazyOracleAbi,
} from './abi/index.js';
import { Cache, Logger } from '../common/decorators/index.js';
import { BusModule } from './bus-module.js';
import { getEncodableContract } from '../common/index.js';
import type {
  DashboardContractType,
  LazyOracleContractType,
  OperatorGridContractType,
  PredepositGuaranteeContractType,
  StakingVaultContractType,
  VaultFactoryContractType,
  VaultHubContractType,
  VaultViewerContractType,
} from './types.js';

export class LidoSDKVaultContracts extends BusModule {
  // Precomputed event signatures
  public static VAULT_CREATED_SIGNATURE = toEventHash(
    getAbiItem({
      abi: VaultCreatedEventAbi,
      name: 'VaultCreated',
    }),
  );
  public static DASHBOARD_CREATED_SIGNATURE = toEventHash(
    getAbiItem({
      abi: DashboardCreatedEventAbi,
      name: 'DashboardCreated',
    }),
  );

  // contracts

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['bus.core.chain.id', 'address'])
  public async getContractVault(
    address: Address,
  ): Promise<StakingVaultContractType> {
    return getEncodableContract(
      getContract({
        address,
        abi: StakingVaultAbi,
        client: this.bus.core.keyedClient,
      }),
    );
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['bus.core.chain.id', 'address'])
  public async getContractVaultDashboard(
    address: Address,
  ): Promise<DashboardContractType> {
    return getEncodableContract(
      getContract({
        address,
        abi: DashboardAbi,
        client: this.bus.core.keyedClient,
      }),
    );
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['bus.core.chain.id'])
  public async getContractVaultHub(): Promise<VaultHubContractType> {
    const address = await this.bus.core
      .getContractLidoLocator()
      .read.vaultHub();

    return getEncodableContract(
      getContract({
        address,
        abi: VaultHubAbi,
        client: this.bus.core.keyedClient,
      }),
    );
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['bus.core.chain.id'])
  public async getContractVaultFactory(): Promise<VaultFactoryContractType> {
    const address = await this.bus.core
      .getContractLidoLocator()
      .read.vaultFactory();

    return getEncodableContract(
      getContract({
        address,
        abi: VaultFactoryAbi,
        client: this.bus.core.keyedClient,
      }),
    );
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['bus.core.chain.id'])
  public async getContractVaultViewer(): Promise<VaultViewerContractType> {
    const address = this.bus.core.getVaultViewerAddress();

    return getEncodableContract(
      getContract({
        address,
        abi: VaultViewerAbi,
        client: this.bus.core.keyedClient,
      }),
    );
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['bus.core.chain.id'])
  public async getContractLazyOracle(): Promise<LazyOracleContractType> {
    const address = await this.bus.core
      .getContractLidoLocator()
      .read.lazyOracle();

    return getEncodableContract(
      getContract({
        address,
        abi: LazyOracleAbi,
        client: this.bus.core.keyedClient,
      }),
    );
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['bus.core.chain.id'])
  public async getContractPredepositGuarantee(): Promise<PredepositGuaranteeContractType> {
    const address = await this.bus.core
      .getContractLidoLocator()
      .read.predepositGuarantee();

    return getEncodableContract(
      getContract({
        address,
        abi: PredepositGuaranteeAbi,
        client: this.bus.core.keyedClient,
      }),
    );
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['bus.core.chain.id'])
  public async getContractOperatorGrid(): Promise<OperatorGridContractType> {
    const address = await this.bus.core
      .getContractLidoLocator()
      .read.operatorGrid();

    return getEncodableContract(
      getContract({
        address,
        abi: OperatorGridAbi,
        client: this.bus.core.keyedClient,
      }),
    );
  }
}

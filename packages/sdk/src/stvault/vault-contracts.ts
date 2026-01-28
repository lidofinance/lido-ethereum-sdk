import {
  Address,
  getAbiItem,
  getContract,
  GetContractReturnType,
  toEventHash,
  WalletClient,
} from 'viem';
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
import { EncodableContract, getEncodableContract } from '../common/index.js';

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
  ): Promise<
    EncodableContract<
      GetContractReturnType<typeof StakingVaultAbi, WalletClient>
    >
  > {
    return getEncodableContract(
      getContract({
        address,
        abi: StakingVaultAbi,
        client: {
          public: this.bus.core.rpcProvider,
          wallet: this.bus.core.web3Provider as WalletClient,
        },
      }),
    );
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['bus.core.chain.id', 'address'])
  public async getContractVaultDashboard(
    address: Address,
  ): Promise<
    EncodableContract<GetContractReturnType<typeof DashboardAbi, WalletClient>>
  > {
    return getEncodableContract(
      getContract({
        address,
        abi: DashboardAbi,
        client: {
          public: this.bus.core.rpcProvider,
          wallet: this.bus.core.web3Provider as WalletClient,
        },
      }),
    );
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['bus.core.chain.id'])
  public async getContractVaultHub(): Promise<
    EncodableContract<GetContractReturnType<typeof VaultHubAbi, WalletClient>>
  > {
    const address = await this.bus.core
      .getContractLidoLocator()
      .read.vaultHub();

    return getEncodableContract(
      getContract({
        address,
        abi: VaultHubAbi,
        client: {
          public: this.bus.core.rpcProvider,
          wallet: this.bus.core.web3Provider as WalletClient,
        },
      }),
    );
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['bus.core.chain.id'])
  public async getContractVaultFactory(): Promise<
    EncodableContract<
      GetContractReturnType<typeof VaultFactoryAbi, WalletClient>
    >
  > {
    const address = await this.bus.core
      .getContractLidoLocator()
      .read.vaultFactory();

    return getEncodableContract(
      getContract({
        address,
        abi: VaultFactoryAbi,
        client: {
          public: this.bus.core.rpcProvider,
          wallet: this.bus.core.web3Provider as WalletClient,
        },
      }),
    );
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['bus.core.chain.id'])
  public async getContractVaultViewer(): Promise<
    EncodableContract<
      GetContractReturnType<typeof VaultViewerAbi, WalletClient>
    >
  > {
    const address = this.bus.core.getVaultViewerAddress();

    return getEncodableContract(
      getContract({
        address,
        abi: VaultViewerAbi,
        client: {
          public: this.bus.core.rpcProvider,
        },
      }),
    );
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['bus.core.chain.id'])
  public async getContractLazyOracle(): Promise<
    EncodableContract<GetContractReturnType<typeof LazyOracleAbi, WalletClient>>
  > {
    const address = await this.bus.core
      .getContractLidoLocator()
      .read.lazyOracle();

    return getEncodableContract(
      getContract({
        address,
        abi: LazyOracleAbi,
        client: {
          public: this.bus.core.rpcProvider,
          wallet: this.bus.core.web3Provider as WalletClient,
        },
      }),
    );
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['bus.core.chain.id'])
  public async getContractPredepositGuarantee(): Promise<
    EncodableContract<
      GetContractReturnType<typeof PredepositGuaranteeAbi, WalletClient>
    >
  > {
    const address = await this.bus.core
      .getContractLidoLocator()
      .read.predepositGuarantee();

    return getEncodableContract(
      getContract({
        address,
        abi: PredepositGuaranteeAbi,
        client: {
          public: this.bus.core.rpcProvider,
          wallet: this.bus.core.web3Provider as WalletClient,
        },
      }),
    );
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['bus.core.chain.id'])
  public async getContractOperatorGrid(): Promise<
    EncodableContract<
      GetContractReturnType<typeof OperatorGridAbi, WalletClient>
    >
  > {
    const address = await this.bus.core
      .getContractLidoLocator()
      .read.operatorGrid();

    return getEncodableContract(
      getContract({
        address,
        abi: OperatorGridAbi,
        client: {
          public: this.bus.core.rpcProvider,
          wallet: this.bus.core.web3Provider as WalletClient,
        },
      }),
    );
  }
}

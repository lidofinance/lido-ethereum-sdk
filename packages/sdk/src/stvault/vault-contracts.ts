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
  StakingVaultAbi,
  VaultCreatedEventAbi,
  VaultFactoryAbi,
  VaultHubAbi,
  VaultViewerAbi,
} from './abi/index.js';
import { Cache, Logger } from '../common/decorators/index.js';
import { BusModule } from './bus-module.js';
import { LazyOracleAbi } from './abi/LazyOracle.js';

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
  ): Promise<GetContractReturnType<typeof StakingVaultAbi, WalletClient>> {
    return getContract({
      address,
      abi: StakingVaultAbi,
      client: {
        public: this.bus.core.rpcProvider,
        wallet: this.bus.core.web3Provider as WalletClient,
      },
    });
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['bus.core.chain.id', 'address'])
  public async getContractVaultDashboard(
    address: Address,
  ): Promise<GetContractReturnType<typeof DashboardAbi, WalletClient>> {
    return getContract({
      address,
      abi: DashboardAbi,
      client: {
        public: this.bus.core.rpcProvider,
        wallet: this.bus.core.web3Provider as WalletClient,
      },
    });
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['bus.core.chain.id'])
  public async getContractVaultHub(): Promise<
    GetContractReturnType<typeof VaultHubAbi, WalletClient>
  > {
    const address = await this.bus.core
      .getContractLidoLocator()
      .read.vaultHub();

    return getContract({
      address,
      abi: VaultHubAbi,
      client: {
        public: this.bus.core.rpcProvider,
        wallet: this.bus.core.web3Provider as WalletClient,
      },
    });
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['bus.core.chain.id'])
  public async getContractVaultFactory(): Promise<
    GetContractReturnType<typeof VaultFactoryAbi, WalletClient>
  > {
    const address = await this.bus.core
      .getContractLidoLocator()
      .read.vaultFactory();

    return getContract({
      address,
      abi: VaultFactoryAbi,
      client: {
        public: this.bus.core.rpcProvider,
        wallet: this.bus.core.web3Provider as WalletClient,
      },
    });
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['bus.core.chain.id'])
  public async getContractVaultViewer(): Promise<
    GetContractReturnType<typeof VaultViewerAbi, WalletClient>
  > {
    const address = this.bus.core.getVaultViewerAddress();

    return getContract({
      address,
      abi: VaultViewerAbi,
      client: {
        public: this.bus.core.rpcProvider,
      },
    });
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['bus.core.chain.id'])
  public async getContractLazyOracle(): Promise<
    GetContractReturnType<typeof LazyOracleAbi, WalletClient>
  > {
    const address = await this.bus.core
      .getContractLidoLocator()
      .read.lazyOracle();

    return getContract({
      address,
      abi: LazyOracleAbi,
      client: {
        public: this.bus.core.rpcProvider,
        wallet: this.bus.core.web3Provider as WalletClient,
      },
    });
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['bus.core.chain.id'])
  public async getContractOperatorGrid(): Promise<
    GetContractReturnType<typeof OperatorGridAbi, WalletClient>
  > {
    const address = await this.bus.core
      .getContractLidoLocator()
      .read.operatorGrid();

    return getContract({
      address,
      abi: OperatorGridAbi,
      client: {
        public: this.bus.core.rpcProvider,
        wallet: this.bus.core.web3Provider as WalletClient,
      },
    });
  }
}

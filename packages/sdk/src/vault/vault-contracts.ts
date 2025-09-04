import { Cache, Logger } from '../common/decorators/index.js';
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
  StakingVaultAbi,
  VaultCreatedEventAbi,
  VaultFactoryAbi,
  VaultHubAbi,
  VaultViewerAbi,
} from './abi/index.js';
import { vaultsAddresses } from './consts/vaults-addresses.js';
import { BusModule } from './bus-module.js';

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
  public async getVaultDashboard(
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
  public async getVaultHub(): Promise<
    GetContractReturnType<typeof VaultHubAbi, WalletClient>
  > {
    const address = vaultsAddresses.vaultHub;
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
    const address = vaultsAddresses.vaultFactory;

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
    const address = vaultsAddresses.vaultViewer;

    return getContract({
      address,
      abi: VaultViewerAbi,
      client: {
        public: this.bus.core.rpcProvider,
        wallet: this.bus.core.web3Provider as WalletClient,
      },
    });
  }
}

import { LidoSDKModule } from '../common/class-primitives/sdk-module.js';
import { Cache, Logger } from '../common/decorators/index.js';
import {
  Address,
  encodeFunctionData,
  getContract,
  GetContractReturnType,
  WalletClient,
} from 'viem';
import { DashboardAbi, StakingVaultAbi, VaultHubAbi } from './abi/index.js';
import {
  type PopulatedTransaction,
  type TransactionResult,
} from '../core/index.js';
import { NOOP } from '../common/index.js';
import { FundByDashboardPros, FundByVaultPros } from './types.js';
import { vaultsAddresses } from './consts/vaults-addresses.js';

export class LidoSDKVault extends LidoSDKModule {
  @Logger('Contracts:')
  public async getContractVault(
    address: Address,
  ): Promise<GetContractReturnType<typeof StakingVaultAbi, WalletClient>> {
    return getContract({
      address,
      abi: StakingVaultAbi,
      client: {
        public: this.core.rpcProvider,
        wallet: this.core.web3Provider as WalletClient,
      },
    });
  }
  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['core.chain.id'])
  public async getVaultDashboard(
    address: Address,
  ): Promise<GetContractReturnType<typeof DashboardAbi, WalletClient>> {
    return getContract({
      address,
      abi: DashboardAbi,
      client: {
        public: this.core.rpcProvider,
        wallet: this.core.web3Provider as WalletClient,
      },
    });
  }
  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['core.chain.id'])
  public async getVaultHub(): Promise<
    GetContractReturnType<typeof VaultHubAbi, WalletClient>
  > {
    const address = vaultsAddresses.vaultHub;
    return getContract({
      address,
      abi: VaultHubAbi,
      client: {
        public: this.core.rpcProvider,
        wallet: this.core.web3Provider as WalletClient,
      },
    });
  }

  public fund(props: FundByVaultPros): Promise<TransactionResult>;
  public fund(props: FundByDashboardPros): Promise<TransactionResult>;

  public async fund(
    props: FundByVaultPros | FundByDashboardPros,
  ): Promise<TransactionResult> {
    const parsedProps = await this.parseProps(props);

    return this.core.performTransaction({
      ...parsedProps,
      getGasLimit: (options) =>
        parsedProps.dashboard.estimateGas.fund({
          ...options,
          value: props.value,
        }),
      sendTransaction: (options) =>
        parsedProps.dashboard.write.fund({ ...options, value: props.value }),
    });
  }

  public fundPopulateTx(props: FundByVaultPros): Promise<PopulatedTransaction>;
  public fundPopulateTx(
    props: FundByDashboardPros,
  ): Promise<PopulatedTransaction>;

  async fundPopulateTx(
    props: FundByVaultPros | FundByDashboardPros,
  ): Promise<PopulatedTransaction> {
    const parsedProps = await this.parseProps(props);

    return {
      from: parsedProps.account.address,
      to: parsedProps.dashboard.address,
      value: parsedProps.value,
      data: encodeFunctionData({
        abi: parsedProps.dashboard.abi,
        functionName: 'fund',
        args: [],
      }),
    };
  }

  private async parseProps(props: FundByVaultPros | FundByDashboardPros) {
    let dashboard;
    if ('dashboardAddress' in props) {
      dashboard = await this.getVaultDashboard(props.dashboardAddress);
    } else {
      const vaultHub = await this.getVaultHub();
      const vaultConnection = await vaultHub.read.vaultConnection([
        props.vaultAddress,
      ]);
      const dashboardAddress = vaultConnection.owner;
      dashboard = await this.getVaultDashboard(dashboardAddress);
    }

    return {
      ...props,
      dashboard,
      callback: props.callback ?? NOOP,
      account: await this.core.useAccount(props.account),
    };
  }
}

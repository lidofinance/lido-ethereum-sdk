import {
  Address,
  encodeFunctionData,
  GetContractReturnType,
  WalletClient,
} from 'viem';
import {
  CommonTransactionProps,
  PopulatedTransaction,
  TransactionResult,
} from '../core/types.js';
import { BusModule } from './bus-module.js';
import {
  FundPros,
  type LidoSDKVaultsModuleProps,
  WithdrawProps,
} from './types.js';
import { NOOP } from '../common/index.js';
import type { ParsedProps } from '../unsteth/types.js';
import { DashboardAbi } from './abi/index.js';

type LidoSDKVaultEntityProps = LidoSDKVaultsModuleProps & {
  dashboardAddress?: Address;
  vaultAddress: Address;
};

export class LidoSDKVaultEntity extends BusModule {
  private dashboardAddress?: Address;
  private readonly vaultAddress: Address;

  constructor(props: LidoSDKVaultEntityProps) {
    super(props);
    this.vaultAddress = props.vaultAddress;
    this.dashboardAddress = props.dashboardAddress;
  }

  public getVaultAddress(): Address {
    return this.vaultAddress;
  }

  public async getDashboardAddress(): Promise<Address> {
    if (this.dashboardAddress) {
      return this.dashboardAddress;
    }

    const vaultHub = await this.bus.contracts.getVaultHub();
    const vaultConnection = await vaultHub.read.vaultConnection([
      this.vaultAddress,
    ]);
    this.dashboardAddress = vaultConnection.owner;

    return this.dashboardAddress;
  }

  public async fund(props: FundPros): Promise<TransactionResult> {
    const parsedProps = await this.parseProps(props);

    return this.bus.core.performTransaction({
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

  public fundPopulateTx(props: FundPros): Promise<PopulatedTransaction>;

  async fundPopulateTx(props: FundPros): Promise<PopulatedTransaction> {
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

  private async parseProps<TProps extends CommonTransactionProps>(
    props: TProps,
  ): Promise<
    ParsedProps<
      TProps & {
        dashboard: GetContractReturnType<typeof DashboardAbi, WalletClient>;
      }
    >
  > {
    const dashboardAddress = await this.getDashboardAddress();
    const dashboard =
      await this.bus.contracts.getVaultDashboard(dashboardAddress);

    return {
      ...props,
      dashboard,
      callback: props.callback ?? NOOP,
      account: await this.bus.core.useAccount(props.account),
    };
  }

  async withdraw(props: WithdrawProps) {
    const parsedProps = await this.parseProps(props);

    return this.bus.core.performTransaction({
      ...parsedProps,
      getGasLimit: (options) =>
        parsedProps.dashboard.estimateGas.withdraw(
          [props.address, props.amount],
          options,
        ),
      sendTransaction: (options) =>
        parsedProps.dashboard.write.withdraw(
          [props.address, props.amount],
          options,
        ),
    });
  }
}

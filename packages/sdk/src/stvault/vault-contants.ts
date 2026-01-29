import { BusModule } from './bus-module.js';
import { dashboardRoles, RoleName } from './consts/index.js';
import { Hex } from 'viem';
import { Cache, ErrorHandler, Logger } from '../common/decorators/index.js';

export class LidoSDKVaultConstants extends BusModule {
  @Logger('Utils:')
  @ErrorHandler()
  @Cache(30 * 60 * 1000, ['bus.core.chain.id'])
  public async CONNECT_DEPOSIT() {
    const vaultHub = await this.bus.contracts.getContractVaultHub();

    return vaultHub.read.CONNECT_DEPOSIT();
  }

  @Logger('Utils:')
  @ErrorHandler()
  @Cache(30 * 60 * 1000, ['bus.core.chain.id'])
  public async MIN_CONFIRM_EXPIRY() {
    const vaultFactory = await this.bus.contracts.getContractOperatorGrid();

    return vaultFactory.read.MIN_CONFIRM_EXPIRY();
  }

  @Logger('Utils:')
  @ErrorHandler()
  @Cache(30 * 60 * 1000, ['bus.core.chain.id'])
  public async MAX_CONFIRM_EXPIRY() {
    const vaultFactory = await this.bus.contracts.getContractOperatorGrid();

    return vaultFactory.read.MAX_CONFIRM_EXPIRY();
  }

  @Logger('Utils:')
  @ErrorHandler()
  @Cache(30 * 60 * 1000, ['bus.core.chain.id'])
  public async ROLES() {
    const vaultFactory = await this.bus.contracts.getContractVaultFactory();
    const implementationAddress = await vaultFactory.read.DASHBOARD_IMPL();
    const dashboardContract =
      await this.bus.contracts.getContractVaultDashboard(implementationAddress);

    const roleValues: Hex[] = await Promise.all(
      dashboardRoles.map((key) => (dashboardContract.read as any)[key]()),
    );

    return Object.fromEntries(
      dashboardRoles.map((key, index) => [key, roleValues[index]]),
    ) as Record<RoleName, Hex>;
  }
}

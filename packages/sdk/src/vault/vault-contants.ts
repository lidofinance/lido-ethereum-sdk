import { BusModule } from './bus-module.js';

export class LidoSDKVaultConstants extends BusModule {
  public async CONNECT_DEPOSIT() {
    const vaultHub = await this.bus.contracts.getVaultHub();

    return vaultHub.read.CONNECT_DEPOSIT();
  }

  public async MIN_CONFIRM_EXPIRY() {
    const vaultFactory = await this.bus.contracts.getContractOperatorGrid();

    return vaultFactory.read.MIN_CONFIRM_EXPIRY();
  }

  public async MAX_CONFIRM_EXPIRY() {
    const vaultFactory = await this.bus.contracts.getContractOperatorGrid();

    return vaultFactory.read.MAX_CONFIRM_EXPIRY();
  }
}

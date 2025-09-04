import { LidoSDKModule } from '../common/class-primitives/sdk-module.js';
import { LidoSDKVaultContracts } from './vault-contracts.js';
import { LidoSDKVaultFactory } from './vault-factory.js';
import { LidoSDKVaultViewer } from './vault-viewer.js';

export class Bus extends LidoSDKModule {
  private version: string | undefined;

  private contractsInstance: LidoSDKVaultContracts | undefined;
  private vaultFactoryInstance: LidoSDKVaultFactory | undefined;
  private vaultViewerInstance: LidoSDKVaultViewer | undefined;

  get contracts(): LidoSDKVaultContracts {
    if (!this.contractsInstance) {
      this.contractsInstance = new LidoSDKVaultContracts({
        bus: this,
        version: this.version,
      });
    }
    return this.contractsInstance;
  }

  get vaultViewer(): LidoSDKVaultViewer {
    if (!this.vaultViewerInstance) {
      this.vaultViewerInstance = new LidoSDKVaultViewer({
        bus: this,
        version: this.version,
      });
    }
    return this.vaultViewerInstance;
  }

  get vaultFactory(): LidoSDKVaultFactory {
    if (!this.vaultFactoryInstance) {
      this.vaultFactoryInstance = new LidoSDKVaultFactory({
        bus: this,
        version: this.version,
      });
    }
    return this.vaultFactoryInstance;
  }
}

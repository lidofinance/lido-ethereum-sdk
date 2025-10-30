import { ErrorHandler, Logger } from '../common/decorators/index.js';
import { LidoSDKVaultsModuleProps } from './types.js';
import { BusModule } from './bus-module.js';

export class LidoSDKVaultLazyOracle extends BusModule {
  constructor(props: LidoSDKVaultsModuleProps) {
    super(props);
  }

  @Logger('Views:')
  @ErrorHandler()
  public async getLastReportData() {
    const lazyOracleContract = await this.bus.contracts.getContractLazyOracle();
    const [timestamp, refSlot, treeRoot, cid] =
      await lazyOracleContract.read.latestReportData();
    return { timestamp, refSlot, treeRoot, cid };
  }
}

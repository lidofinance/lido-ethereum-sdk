import type { Address, ContractFunctionParameters } from 'viem';
import { Logger } from '../common/decorators/index.js';
import { LidoSDKModule } from '../common/class-primitives/sdk-module.js';
import { LidoSDKVaultContracts } from './vault-contracts.js';
import { LidoSDKVaultFactory } from './vault-factory.js';
import { LidoSDKVaultViewer } from './vault-viewer.js';
import { LidoSDKstETH, LidoSDKwstETH } from '../erc20/index.js';
import { LidoSDKVaultEntity } from './vault-entity.js';
import { LidoSDKVaultLazyOracle } from './vault-lazy-oracle.js';
import { LidoSDKVaultConstants } from './vault-contants.js';
import { getEncodableContract } from '../common/utils/get-encodable-contract.js';
import { SubmitLatestReportProps } from './types.js';

export class Bus extends LidoSDKModule {
  private version: string | undefined;

  private contractsInstance: LidoSDKVaultContracts | undefined;
  private vaultFactoryInstance: LidoSDKVaultFactory | undefined;
  private vaultViewerInstance: LidoSDKVaultViewer | undefined;
  private lazyOracleInstance: LidoSDKVaultLazyOracle | undefined;
  private constantsInstance: LidoSDKVaultConstants | undefined;

  // erc20 modules
  private wstethInstance: LidoSDKwstETH | undefined;
  private stethInstance: LidoSDKstETH | undefined;

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

  get wsteth(): LidoSDKwstETH {
    if (!this.wstethInstance) {
      this.wstethInstance = new LidoSDKwstETH({
        core: this.core,
      });
    }
    return this.wstethInstance;
  }

  get steth(): LidoSDKstETH {
    if (!this.stethInstance) {
      this.stethInstance = new LidoSDKstETH({
        core: this.core,
      });
    }
    return this.stethInstance;
  }

  get lazyOracle(): LidoSDKVaultLazyOracle {
    if (!this.lazyOracleInstance) {
      this.lazyOracleInstance = new LidoSDKVaultLazyOracle({
        bus: this,
      });
    }
    return this.lazyOracleInstance;
  }

  get constants(): LidoSDKVaultConstants {
    if (!this.constantsInstance) {
      this.constantsInstance = new LidoSDKVaultConstants({
        bus: this,
      });
    }
    return this.constantsInstance;
  }

  @Logger('Utils:')
  vaultFromAddress(vaultAddress: Address, dashboardAddress?: Address) {
    return new LidoSDKVaultEntity({
      bus: this,
      vaultAddress,
      dashboardAddress,
    });
  }

  async readWithLatestReport<
    TContracts extends
      readonly unknown[] = readonly (ContractFunctionParameters & {
      from?: Address;
    })[],
  >(props: { contracts: TContracts } & SubmitLatestReportProps) {
    const args = await this.lazyOracle.getSubmitLatestReportTxArgs({
      vaultAddress: props.vaultAddress,
      skipIsFresh: props.skipIsFresh,
    });
    const lazyOracleContract = getEncodableContract(
      await this.contracts.getContractLazyOracle(),
    );

    return this.core.rpcProvider.multicall({
      contracts: [
        lazyOracleContract.prepare.updateVaultData(args),
        ...props.contracts,
      ] as any,
    });
  }
}

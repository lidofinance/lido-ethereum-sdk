import type {
  Address,
  ContractFunctionParameters,
  MulticallReturnType,
} from 'viem';
import { Logger } from '../common/decorators/index.js';
import { LidoSDKModule } from '../common/class-primitives/sdk-module.js';
import { LidoSDKVaultContracts } from './vault-contracts.js';
import { LidoSDKVaultFactory } from './vault-factory.js';
import { LidoSDKVaultViewer } from './vault-viewer.js';
import { LidoSDKstETH, LidoSDKwstETH } from '../erc20/index.js';
import { LidoSDKVaultEntity } from './vault-entity.js';
import { LidoSDKVaultLazyOracle } from './vault-lazy-oracle.js';
import { LidoSDKVaultConstants } from './vault-contants.js';
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
  public vaultFromAddress(vaultAddress: Address, dashboardAddress?: Address) {
    return new LidoSDKVaultEntity({
      bus: this,
      vaultAddress,
      dashboardAddress,
    });
  }

  public async readWithLatestReport<
    TMethods extends readonly (ContractFunctionParameters & {
      from?: Address;
    })[],
  >(
    props: {
      preparedMethods: TMethods;
      blockNumber: bigint;
    } & SubmitLatestReportProps,
  ) {
    const args = await this.lazyOracle.getSubmitLatestReportTxArgs({
      vaultAddress: props.vaultAddress,
      skipIsFresh: props.skipIsFresh,
    });

    const lazyOracleContract = await this.contracts.getContractLazyOracle();

    const updateCall = lazyOracleContract.prepare.updateVaultData(args);

    const allResults = await this.core.rpcProvider.multicall({
      contracts: [updateCall, ...props.preparedMethods] as any,
      allowFailure: false,
      blockNumber: props.blockNumber,
    });

    const [, ...results] = allResults;

    return results as MulticallReturnType<TMethods, false>;
  }
}

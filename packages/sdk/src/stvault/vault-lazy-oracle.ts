import { ErrorHandler, Logger } from '../common/decorators/index.js';
import { LidoSDKVaultsModuleProps, SubmitLatestReportProps } from './types.js';
import { BusModule } from './bus-module.js';
import { encodeFunctionData } from 'viem';
import { getReportProofByVault } from './utils/report-proof.js';
import { CommonTransactionProps } from '../core/index.js';
import type { ParsedProps } from '../unsteth/types.js';
import { NOOP } from '../common/index.js';

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

  @Logger('Utils:')
  private async parseProps(
    props: CommonTransactionProps,
  ): Promise<ParsedProps<CommonTransactionProps>> {
    return {
      ...props,
      callback: props.callback ?? NOOP,
      account: await this.bus.core.useAccount(props.account),
    };
  }

  @Logger('Utils:')
  @ErrorHandler()
  private async getSubmitLatestReportTxArgs(props: SubmitLatestReportProps) {
    const { gateway, vaultAddress } = props;

    const lazyOracleContract = await this.bus.contracts.getContractLazyOracle();
    const vaultHubContract = await this.bus.contracts.getVaultHub();

    const latestReportData = await lazyOracleContract.read.latestReportData();
    const vaultsDataReportCid = latestReportData[3];

    if (!props.skipIsFresh) {
      const isReportFresh = await vaultHubContract.read.isReportFresh([
        vaultAddress,
      ]);

      if (isReportFresh) {
        throw new Error('Report is fresh. You dont need to submit it again');
      }
    }

    const proof = await getReportProofByVault({
      vault: vaultAddress,
      cid: vaultsDataReportCid,
      gateway,
    });

    return [
      vaultAddress,
      BigInt(proof.data.totalValueWei),
      BigInt(proof.data.fee),
      BigInt(proof.data.liabilityShares),
      BigInt(proof.data.maxLiabilityShares),
      BigInt(proof.data.slashingReserve),
      proof.proof,
    ] as const;
  }

  @Logger('Call:')
  @ErrorHandler()
  async submitLatestReport(props: SubmitLatestReportProps) {
    const parsedProps = await this.parseProps(props);
    const txArgs = await this.getSubmitLatestReportTxArgs(props);
    const lazyOracleContract = await this.bus.contracts.getContractLazyOracle();

    return this.bus.core.performTransaction({
      ...parsedProps,
      getGasLimit: (options) =>
        lazyOracleContract.estimateGas.updateVaultData(txArgs, options),
      sendTransaction: (options) =>
        lazyOracleContract.write.updateVaultData(txArgs, options),
    });
  }

  @Logger('Call:')
  @ErrorHandler()
  async submitLatestReportSimulateTx(props: SubmitLatestReportProps) {
    const parsedProps = await this.parseProps(props);
    const txArgs = await this.getSubmitLatestReportTxArgs(props);
    const lazyOracleContract = await this.bus.contracts.getContractLazyOracle();

    return lazyOracleContract.simulate.updateVaultData(txArgs, {
      account: parsedProps.account,
    });
  }

  @Logger('Utils:')
  @ErrorHandler()
  async submitLatestReportPopulateTx(props: SubmitLatestReportProps) {
    const parsedProps = await this.parseProps(props);
    const txArgs = await this.getSubmitLatestReportTxArgs(props);
    const lazyOracleContract = await this.bus.contracts.getContractLazyOracle();

    return {
      from: parsedProps.account.address,
      to: lazyOracleContract.address,
      data: encodeFunctionData({
        abi: lazyOracleContract.abi,
        functionName: 'updateVaultData',
        args: txArgs,
      }),
    };
  }
}

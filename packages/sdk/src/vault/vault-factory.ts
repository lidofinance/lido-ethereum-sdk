import {
  type Address,
  decodeEventLog,
  isAddress,
  TransactionReceipt,
  type WriteContractParameters,
} from 'viem';
import { type TransactionResult, TransactionOptions } from '../core/index.js';
import type { NoTxOptions } from '../core/types.js';
import { Logger, ErrorHandler } from '../common/decorators/index.js';
import { NOOP } from '../common/constants.js';
import { CreateVaultProps, CreateVaultResult } from './types.js';

import {
  DashboardCreatedEventAbi,
  VaultCreatedEventAbi,
} from './abi/VaultFactory.js';
import { VAULTS_CONNECT_DEPOSIT } from './consts/common.js';
import { ERROR_CODE, invariant } from '../common/index.js';
import { BusModule } from './bus-module.js';
import { LidoSDKVaultContracts } from './vault-contracts.js';
import { LidoSDKVaultEntity } from './vault-entity.js';

export class LidoSDKVaultFactory extends BusModule {
  // Calls
  // todo min max confirmExpiry
  // todo roles enum
  @Logger('Call:')
  @ErrorHandler()
  public async createVault(
    props: CreateVaultProps,
  ): Promise<TransactionResult<CreateVaultResult>> {
    this.bus.core.useWeb3Provider();
    const { callback, account, txArgs, ...rest } = await this.parseProps(props);
    const contract = await this.bus.contracts.getContractVaultFactory();

    return this.bus.core.performTransaction<CreateVaultResult>({
      ...rest,
      callback,
      account,
      getGasLimit: async (options) =>
        this.createVaultEstimateGas({ account, ...rest }, options),
      sendTransaction: (options) =>
        contract.write.createVaultWithDashboard(txArgs, {
          ...options,
          value: VAULTS_CONNECT_DEPOSIT,
        }),
      decodeResult: async (receipt) => this.createVaultParseEvents(receipt),
    });
  }

  @Logger('Call:')
  @ErrorHandler()
  public async createVaultSimulateTx(
    props: CreateVaultProps,
  ): Promise<WriteContractParameters> {
    this.bus.core.useWeb3Provider();
    const { account, txArgs } = await this.parseProps(props);
    const contract = await this.bus.contracts.getContractVaultFactory();
    const { request } = await contract.simulate.createVaultWithDashboard(
      txArgs,
      {
        account,
        value: VAULTS_CONNECT_DEPOSIT,
      },
    );

    return request;
  }

  // Utils

  @Logger('Utils:')
  private async createVaultParseEvents(
    receipt: TransactionReceipt,
  ): Promise<CreateVaultResult> {
    let vault: Address | undefined;
    let dashboard: Address | undefined;
    for (const log of receipt.logs) {
      if (log.topics[0] === LidoSDKVaultContracts.VAULT_CREATED_SIGNATURE) {
        const parsedLog = decodeEventLog({
          abi: VaultCreatedEventAbi,
          strict: true,
          ...log,
        });

        if (isAddress(parsedLog.args.vault)) {
          vault = parsedLog.args.vault;
        }
      } else if (
        log.topics[0] === LidoSDKVaultContracts.DASHBOARD_CREATED_SIGNATURE
      ) {
        const parsedLog = decodeEventLog({
          abi: DashboardCreatedEventAbi,
          strict: true,
          ...log,
        });

        if (isAddress(parsedLog.args.dashboard)) {
          dashboard = parsedLog.args.dashboard;
        }
      }
    }

    invariant(
      dashboard,
      'could not find DashboardCreated event in transaction',
      ERROR_CODE.TRANSACTION_ERROR,
    );

    invariant(
      vault,
      'could not find VaultCreated event in transaction',
      ERROR_CODE.TRANSACTION_ERROR,
    );

    return {
      vault: this.vaultFromAddress(vault, dashboard),
    };
  }

  @Logger('Utils:')
  public async createVaultEstimateGas(
    props: NoTxOptions<CreateVaultProps>,
    options?: TransactionOptions,
  ): Promise<bigint> {
    const { account, txArgs } = await this.parseProps(props);
    const contract = await this.bus.contracts.getContractVaultFactory();
    return await contract.estimateGas.createVaultWithDashboard(txArgs, {
      account,
      ...options,
      value: VAULTS_CONNECT_DEPOSIT,
    });
  }

  private async parseProps(props: CreateVaultProps) {
    const {
      defaultAdmin,
      nodeOperator,
      nodeOperatorManager,
      nodeOperatorFeeBP,
      confirmExpiry,
      roleAssignments,
    } = props;

    return {
      ...props,
      txArgs: [
        defaultAdmin,
        nodeOperator,
        nodeOperatorManager,
        nodeOperatorFeeBP,
        confirmExpiry,
        roleAssignments,
      ] as const,
      account: await this.bus.core.useAccount(props.account),
      callback: props.callback ?? NOOP,
    };
  }

  vaultFromAddress(vaultAddress: Address, dashboardAddress?: Address) {
    return new LidoSDKVaultEntity({
      bus: this.bus,
      vaultAddress,
      dashboardAddress,
    });
  }
}

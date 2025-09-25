import { decodeEventLog, isAddress } from 'viem';
import type {
  Address,
  Hash,
  WriteContractParameters,
  TransactionReceipt,
} from 'viem';

import { ErrorHandler, Logger } from '../common/decorators/index.js';
import { NOOP } from '../common/constants.js';
import { CreateVaultProps, CreateVaultResult } from './types.js';
import type { TransactionResult } from '../core/index.js';
import {
  DashboardCreatedEventAbi,
  VaultCreatedEventAbi,
} from './abi/VaultFactory.js';
import {
  MAX_CONFIRM_EXPIRY,
  MAX_NODE_OPERATOR_FEE_RATE,
  MIN_CONFIRM_EXPIRY,
  VAULTS_CONNECT_DEPOSIT,
} from './consts/common.js';
import { ERROR_CODE, invariant } from '../common/index.js';
import { BusModule } from './bus-module.js';
import { LidoSDKVaultContracts } from './vault-contracts.js';
import { validateRole } from './consts/roles.js';

export class LidoSDKVaultFactory extends BusModule {
  private _validateNodeOperatorFeeRate(nodeOperatorFeeRate: bigint) {
    if (nodeOperatorFeeRate > MAX_NODE_OPERATOR_FEE_RATE) {
      throw this.bus.core.error({
        code: ERROR_CODE.INVALID_ARGUMENT,
        message: 'Invalid node operator fee rate.',
      });
    }
  }

  private _validateConfirmExpiry(confirmExpiry: bigint) {
    if (
      confirmExpiry < MIN_CONFIRM_EXPIRY ||
      confirmExpiry > MAX_CONFIRM_EXPIRY
    ) {
      throw this.bus.core.error({
        code: ERROR_CODE.INVALID_ARGUMENT,
        message: 'Invalid confirm expiry.',
      });
    }
  }

  private _validateRoles(roles: Array<{ account: Address; role: Hash }>) {
    for (const role of roles) {
      if (!validateRole(role.role)) {
        throw this.bus.core.error({
          code: ERROR_CODE.INVALID_ARGUMENT,
          message: `Invalid role "${role.role}" found.`,
        });
      }
    }
  }

  @Logger('Call:')
  @ErrorHandler()
  public async createVault(
    props: CreateVaultProps,
  ): Promise<TransactionResult<CreateVaultResult>> {
    this._validateRoles(props.roleAssignments);
    this._validateNodeOperatorFeeRate(props.nodeOperatorFeeBP);
    this._validateConfirmExpiry(props.confirmExpiry);

    this.bus.core.useWeb3Provider();
    const { callback, account, txArgs, ...rest } = await this.parseProps(props);
    const contract = await this.bus.contracts.getContractVaultFactory();
    const methodName = !props.withoutConnectingToVaultHub
      ? 'createVaultWithDashboard'
      : 'createVaultWithDashboardWithoutConnectingToVaultHub';

    return this.bus.core.performTransaction<CreateVaultResult>({
      ...rest,
      callback,
      account,
      getGasLimit: async (options) =>
        contract.estimateGas[methodName](txArgs, {
          ...options,
          value: VAULTS_CONNECT_DEPOSIT,
        }),
      sendTransaction: (options) =>
        contract.write[methodName](txArgs, {
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

    return this.bus.vaultFromAddress(vault, dashboard);
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
}

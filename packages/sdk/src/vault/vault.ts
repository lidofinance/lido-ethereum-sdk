import {
  type Address,
  decodeEventLog,
  getAbiItem,
  getContract,
  isAddress,
  toEventHash,
  TransactionReceipt,
} from 'viem';

import type { GetContractReturnType, WalletClient } from 'viem';

import { type TransactionResult, TransactionOptions } from '../core/index.js';
import type { NoTxOptions } from '../core/types.js';
import { Logger, Cache, ErrorHandler } from '../common/decorators/index.js';
import {
  SUBMIT_EXTRA_GAS_TRANSACTION_RATIO,
  NOOP,
  GAS_TRANSACTION_RATIO_PRECISION,
} from '../common/constants.js';
import { CreateVaultProps, CreateVaultResult } from './types.js';

import {
  DashboardCreatedEventAbi,
  VaultCreatedEventAbi,
  VaultFactoryAbi,
} from './abi/VaultFactory.js';
import { vaultsAddresses } from './consts/vaults-addresses.js';
import { VAULTS_CONNECT_DEPOSIT } from './consts/common.js';
import { ERROR_CODE, invariant } from '../common/index.js';
import { LidoSDKModule } from '../common/class-primitives/sdk-module.js';

export class LidoSDKVault extends LidoSDKModule {
  // Precomputed event signatures
  private static VAULT_CREATED_SIGNATURE = toEventHash(
    getAbiItem({
      abi: VaultCreatedEventAbi,
      name: 'VaultCreated',
    }),
  );
  private static DASHBOARD_CREATED_SIGNATURE = toEventHash(
    getAbiItem({
      abi: DashboardCreatedEventAbi,
      name: 'DashboardCreated',
    }),
  );

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, [])
  public async getContractVaultFactory(): Promise<
    GetContractReturnType<typeof VaultFactoryAbi, WalletClient>
  > {
    const address = vaultsAddresses.vaultFactory;

    return getContract({
      address,
      abi: VaultFactoryAbi,
      client: {
        public: this.core.rpcProvider,
        wallet: this.core.web3Provider as WalletClient,
      },
    });
  }

  // Calls

  @Logger('Call:')
  @ErrorHandler()
  public async createVault(
    props: CreateVaultProps,
  ): Promise<TransactionResult<CreateVaultResult>> {
    this.core.useWeb3Provider();
    const { callback, account, ...rest } = await this.parseProps(props);

    const {
      defaultAdmin,
      nodeOperator,
      nodeOperatorManager,
      nodeOperatorFeeBP,
      confirmExpiry,
      roleAssignments,
    } = props;

    const contract = await this.getContractVaultFactory();
    return this.core.performTransaction<CreateVaultResult>({
      ...rest,
      callback,
      account,
      getGasLimit: async (options) =>
        this.createVaultEstimateGas(
          {
            account,
            defaultAdmin,
            nodeOperator,
            nodeOperatorManager,
            nodeOperatorFeeBP,
            confirmExpiry,
            roleAssignments,
          },
          options,
        ),
      sendTransaction: (options) =>
        contract.write.createVaultWithDashboard(
          [
            defaultAdmin,
            nodeOperator,
            nodeOperatorManager,
            nodeOperatorFeeBP,
            confirmExpiry,
            roleAssignments,
          ],
          {
            ...options,
            value: VAULTS_CONNECT_DEPOSIT,
          },
        ),
      decodeResult: async (receipt) => this.createVaultParseEvents(receipt),
    });
  }

  // Utils

  @Logger('Utils:')
  private async createVaultParseEvents(
    receipt: TransactionReceipt,
  ): Promise<CreateVaultResult> {
    let vault: Address | undefined;
    let dashboard: Address | undefined;
    for (const log of receipt.logs) {
      if (log.topics[0] === LidoSDKVault.VAULT_CREATED_SIGNATURE) {
        const parsedLog = decodeEventLog({
          abi: VaultCreatedEventAbi,
          strict: true,
          ...log,
        });

        if (isAddress(parsedLog.args.vault)) {
          vault = parsedLog.args.vault;
        }
      } else if (log.topics[0] === LidoSDKVault.DASHBOARD_CREATED_SIGNATURE) {
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
      vault,
      dashboard,
    };
  }

  @Logger('Utils:')
  @Cache(30 * 1000, ['core.chain.id'])
  public async createVaultEstimateGas(
    props: NoTxOptions<CreateVaultProps>,
    options?: TransactionOptions,
  ): Promise<bigint> {
    const {
      defaultAdmin,
      nodeOperator,
      nodeOperatorManager,
      nodeOperatorFeeBP,
      confirmExpiry,
      roleAssignments,
    } = props;
    const { account } = await this.parseProps(props);
    const contract = await this.getContractVaultFactory();
    const originalGasLimit =
      await contract.estimateGas.createVaultWithDashboard(
        [
          defaultAdmin,
          nodeOperator,
          nodeOperatorManager,
          nodeOperatorFeeBP,
          confirmExpiry,
          roleAssignments,
        ],
        {
          account,
          ...options,
          value: VAULTS_CONNECT_DEPOSIT,
        },
      );

    const gasLimit =
      (originalGasLimit *
        BigInt(
          GAS_TRANSACTION_RATIO_PRECISION * SUBMIT_EXTRA_GAS_TRANSACTION_RATIO,
        )) /
      BigInt(GAS_TRANSACTION_RATIO_PRECISION);

    return gasLimit;
  }

  private async parseProps(props: CreateVaultProps) {
    return {
      ...props,
      account: await this.core.useAccount(props.account),
      callback: props.callback ?? NOOP,
    };
  }
}

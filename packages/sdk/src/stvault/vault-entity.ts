import { encodeFunctionData, isAddressEqual, zeroAddress } from 'viem';
import type { Address, Hash, GetContractReturnType, WalletClient } from 'viem';
import {
  CommonTransactionProps,
  PopulatedTransaction,
  TransactionResult,
} from '../core/types.js';
import { BusModule } from './bus-module.js';
import {
  BurnProps,
  BurnSharesProps,
  FundPros,
  GetLatestVaultReportProps,
  GetVaultRoleMembersProps,
  LidoSDKVaultsModuleProps,
  MintProps,
  MintSharesProps,
  PopulateProps,
  SetRolesProps,
  VaultSubmitReportProps,
  WithdrawProps,
} from './types.js';
import { EncodableContract, ERROR_CODE, NOOP } from '../common/index.js';
import type { ParsedProps } from '../unsteth/types.js';
import {
  DashboardAbi,
  Multicall3AbiUtils,
  StakingVaultAbi,
} from './abi/index.js';
import { Cache, ErrorHandler, Logger } from '../common/decorators/index.js';

import { getVaultReport } from './utils/report.js';
import { PROXY_CODE_PAD_LEFT, PROXY_CODE_PAD_RIGHT } from './consts/index.js';
import {
  OverviewArgs,
  GetVaultOverviewDataProps,
  VaultOverviewData,
} from './utils/overview/types.js';
import { calculateHealth } from './utils/overview/calculate-health.js';
import {
  bigIntCeilDiv,
  bigIntMax,
  bigIntMin,
} from '../common/utils/bigint-math.js';

type LidoSDKVaultEntityProps = LidoSDKVaultsModuleProps & {
  dashboardAddress?: Address;
  vaultAddress: Address;
  skipDashboardCheck?: boolean;
};

export class LidoSDKVaultEntity extends BusModule {
  private dashboardAddress?: Address;
  private readonly vaultAddress: Address;
  private readonly skipDashboardCheck: boolean;

  constructor(props: LidoSDKVaultEntityProps) {
    super(props);
    this.vaultAddress = props.vaultAddress;
    this.dashboardAddress = props.dashboardAddress;
    this.skipDashboardCheck = !!props.skipDashboardCheck;
  }

  @Logger('Utils:')
  private async parseProps(props: CommonTransactionProps): Promise<
    ParsedProps<
      CommonTransactionProps & {
        dashboard: GetContractReturnType<typeof DashboardAbi, WalletClient>;
      }
    >
  > {
    const dashboard = await this.getDashboardContract();

    return {
      ...props,
      dashboard,
      callback: props.callback ?? NOOP,
      account: await this.bus.core.useAccount(props.account),
    };
  }

  public getVaultContract(): Promise<
    EncodableContract<
      GetContractReturnType<typeof StakingVaultAbi, WalletClient>
    >
  > {
    return this.bus.contracts.getContractVault(this.vaultAddress);
  }

  @Logger('Utils:')
  @Cache(30 * 60 * 1000, ['dashboardAddress'])
  @ErrorHandler()
  public async getDashboardContract(): Promise<
    EncodableContract<GetContractReturnType<typeof DashboardAbi, WalletClient>>
  > {
    const dashboardAddress = await this.getDashboardAddress();
    if (!dashboardAddress) {
      throw this.bus.core.error({
        code: ERROR_CODE.READ_ERROR,
        message: 'Dashboard address is not found.',
      });
    }

    return this.bus.contracts.getContractVaultDashboard(dashboardAddress);
  }

  public getVaultAddress(): Address {
    return this.vaultAddress;
  }

  @Logger('Utils:')
  @Cache(30 * 60 * 1000, ['dashboardAddress'])
  @ErrorHandler()
  public async getDashboardAddress(): Promise<Address> {
    if (this.dashboardAddress) {
      return this.dashboardAddress;
    }

    const vaultOwner = await (await this.getVaultContract()).read.owner();

    this.dashboardAddress = vaultOwner;

    if (this.skipDashboardCheck) {
      return this.dashboardAddress;
    }

    const vaultHub = await this.bus.contracts.getContractVaultHub();

    const isVaultConnected = await vaultHub.read.isVaultConnected([
      this.vaultAddress,
    ]);

    if (!isVaultConnected) {
      throw this.bus.core.error({
        code: ERROR_CODE.READ_ERROR,
        message: 'Vault connection is not found.',
      });
    }

    const vaultConnection = await vaultHub.read.vaultConnection([
      this.vaultAddress,
    ]);

    const supposedDashboardAddress = isAddressEqual(
      vaultConnection.owner,
      zeroAddress,
    )
      ? vaultConnection.owner
      : vaultOwner;

    const isOwnerDashboard = await this.isDashboard(supposedDashboardAddress);

    if (!isOwnerDashboard) {
      throw this.bus.core.error({
        code: ERROR_CODE.NOT_SUPPORTED,
        message: 'Owner of vault is not dashboard contract',
      });
    }

    this.dashboardAddress = supposedDashboardAddress;

    return this.dashboardAddress;
  }

  // fund methods
  @Logger('Call:')
  @ErrorHandler()
  public async fund(props: FundPros): Promise<TransactionResult> {
    const parsedProps = await this.parseProps(props);

    return this.bus.core.performTransaction({
      ...parsedProps,
      getGasLimit: (options) =>
        parsedProps.dashboard.estimateGas.fund({
          ...options,
          value: props.value,
        }),
      sendTransaction: (options) =>
        parsedProps.dashboard.write.fund({ ...options, value: props.value }),
    });
  }

  @Logger('Utils:')
  @ErrorHandler()
  public async fundPopulateTx(props: FundPros): Promise<PopulatedTransaction> {
    const parsedProps = await this.parseProps(props);

    return {
      from: parsedProps.account.address,
      to: parsedProps.dashboard.address,
      value: props.value,
      data: encodeFunctionData({
        abi: parsedProps.dashboard.abi,
        functionName: 'fund',
        args: [],
      }),
    };
  }

  @Logger('Call:')
  @ErrorHandler()
  public async fundSimulateTx(props: FundPros) {
    const { dashboard, account } = await this.parseProps(props);
    return await dashboard.simulate.fund({
      account,
      value: props.value,
    });
  }

  // withdraw methods
  @Logger('Call:')
  @ErrorHandler()
  public async withdraw(props: WithdrawProps) {
    const parsedProps = await this.parseProps(props);

    return this.bus.core.performTransaction({
      ...parsedProps,
      getGasLimit: (options) =>
        parsedProps.dashboard.estimateGas.withdraw(
          [props.address, props.amount],
          options,
        ),
      sendTransaction: (options) =>
        parsedProps.dashboard.write.withdraw(
          [props.address, props.amount],
          options,
        ),
    });
  }

  @Logger('Call:')
  @ErrorHandler()
  public async withdrawSimulateTx(props: WithdrawProps) {
    const parsedProps = await this.parseProps(props);

    return await parsedProps.dashboard.simulate.withdraw(
      [props.address, props.amount],
      { account: parsedProps.account },
    );
  }

  @Logger('Utils:')
  @ErrorHandler()
  public async withdrawPopulateTx(
    props: WithdrawProps,
  ): Promise<PopulatedTransaction> {
    const parsedProps = await this.parseProps(props);

    return {
      from: parsedProps.account.address,
      to: parsedProps.dashboard.address,
      data: encodeFunctionData({
        abi: parsedProps.dashboard.abi,
        functionName: 'withdraw',
        args: [props.address, props.amount],
      }),
    };
  }

  // mint methods
  @Logger('Call:')
  @ErrorHandler()
  public async mintShares(props: MintSharesProps) {
    const parsedProps = await this.parseProps(props);

    return this.bus.core.performTransaction({
      ...parsedProps,
      getGasLimit: (options) =>
        parsedProps.dashboard.estimateGas.mintShares(
          [props.recipient, props.amountOfShares],
          options,
        ),
      sendTransaction: (options) =>
        parsedProps.dashboard.write.mintShares(
          [props.recipient, props.amountOfShares],
          options,
        ),
    });
  }

  @Logger('Call:')
  @ErrorHandler()
  public async mintSharesSimulateTx(props: MintSharesProps) {
    const parsedProps = await this.parseProps(props);

    return await parsedProps.dashboard.simulate.mintShares(
      [props.recipient, props.amountOfShares],
      { account: parsedProps.account },
    );
  }

  @Logger('Utils:')
  @ErrorHandler()
  public async mintSharesPopulateTx(props: MintSharesProps) {
    const parsedProps = await this.parseProps(props);

    return {
      from: parsedProps.account.address,
      to: parsedProps.dashboard.address,
      data: encodeFunctionData({
        abi: parsedProps.dashboard.abi,
        functionName: 'mintShares',
        args: [props.recipient, props.amountOfShares],
      }),
    };
  }

  @Logger('Call:')
  @ErrorHandler()
  public async mint(props: MintProps) {
    if (props.token === 'wsteth') {
      return this._mintWstETH(props);
    } else if (props.token === 'steth') {
      return this._mintStETH(props);
    }

    throw new Error('Unsupported token');
  }

  @Logger('Call:')
  @ErrorHandler()
  public async mintSimulateTx(props: MintProps) {
    if (props.token === 'wsteth') {
      return this._mintWstETHSimulateTx(props);
    } else if (props.token === 'steth') {
      return this._mintStETHSimulateTx(props);
    }

    throw new Error('Unsupported token');
  }

  private _validateToken(token: string) {
    if (!['wsteth', 'steth'].includes(token)) {
      throw this.bus.core.error({
        code: ERROR_CODE.INVALID_ARGUMENT,
        message: `Invalid token ${token}.`,
      });
    }
  }

  @Logger('Utils:')
  @ErrorHandler()
  public async mintPopulateTx(props: MintProps) {
    this._validateToken(props.token);

    const parsedProps = await this.parseProps(props);
    const functionName = props.token === 'steth' ? 'mintStETH' : 'mintWstETH';

    return {
      from: parsedProps.account.address,
      to: parsedProps.dashboard.address,
      data: encodeFunctionData({
        abi: parsedProps.dashboard.abi,
        functionName,
        args: [props.recipient, props.amount],
      }),
    };
  }

  @Logger('Call:')
  @ErrorHandler()
  private async _mintStETH(props: MintProps) {
    const parsedProps = await this.parseProps(props);

    return this.bus.core.performTransaction({
      ...parsedProps,
      getGasLimit: (options) =>
        parsedProps.dashboard.estimateGas.mintStETH(
          [props.recipient, props.amount],
          options,
        ),
      sendTransaction: (options) =>
        parsedProps.dashboard.write.mintStETH(
          [props.recipient, props.amount],
          options,
        ),
    });
  }

  @Logger('Call:')
  @ErrorHandler()
  private async _mintStETHSimulateTx(props: MintProps) {
    const parsedProps = await this.parseProps(props);

    return await parsedProps.dashboard.simulate.mintStETH(
      [props.recipient, props.amount],
      { account: parsedProps.account },
    );
  }

  @Logger('Call:')
  @ErrorHandler()
  private async _mintWstETH(props: MintProps) {
    const parsedProps = await this.parseProps(props);

    return this.bus.core.performTransaction({
      ...parsedProps,
      getGasLimit: (options) =>
        parsedProps.dashboard.estimateGas.mintWstETH(
          [props.recipient, props.amount],
          options,
        ),
      sendTransaction: (options) =>
        parsedProps.dashboard.write.mintWstETH(
          [props.recipient, props.amount],
          options,
        ),
    });
  }

  @Logger('Call:')
  @ErrorHandler()
  private async _mintWstETHSimulateTx(props: MintProps) {
    const parsedProps = await this.parseProps(props);

    return await parsedProps.dashboard.simulate.mintWstETH(
      [props.recipient, props.amount],
      { account: parsedProps.account },
    );
  }

  // burn methods
  @Logger('Call:')
  @ErrorHandler()
  public async burnShares(props: BurnSharesProps) {
    const parsedProps = await this.parseProps(props);

    return this.bus.core.performTransaction({
      ...parsedProps,
      getGasLimit: (options) =>
        parsedProps.dashboard.estimateGas.burnShares(
          [props.amountOfShares],
          options,
        ),
      sendTransaction: (options) =>
        parsedProps.dashboard.write.burnShares([props.amountOfShares], options),
    });
  }

  @Logger('Call:')
  @ErrorHandler()
  public async burnSharesSimulateTx(props: BurnSharesProps) {
    const parsedProps = await this.parseProps(props);

    return await parsedProps.dashboard.simulate.burnShares(
      [props.amountOfShares],
      { account: parsedProps.account },
    );
  }

  @Logger('Utils:')
  @ErrorHandler()
  public async burnSharesPopulateTx(props: BurnSharesProps) {
    const parsedProps = await this.parseProps(props);

    return {
      from: parsedProps.account.address,
      to: parsedProps.dashboard.address,
      data: encodeFunctionData({
        abi: parsedProps.dashboard.abi,
        functionName: 'burnShares',
        args: [props.amountOfShares],
      }),
    };
  }

  @Logger('Call:')
  @ErrorHandler()
  public async approve(props: PopulateProps) {
    const isSteth = props.token === 'steth';
    const tokenContract = isSteth ? this.bus.steth : this.bus.wsteth;
    const dashboardAddress = await this.getDashboardAddress();

    return await tokenContract.approve({
      to: dashboardAddress,
      amount: props.amount,
    });
  }

  private async _validateAllowance(props: BurnProps) {
    const isSteth = props.token === 'steth';
    const tokenContract = isSteth ? this.bus.steth : this.bus.wsteth;
    const dashboardAddress = await this.getDashboardAddress();

    const allowance = await tokenContract.allowance({
      to: dashboardAddress,
    });

    if (allowance < props.amount) {
      throw this.bus.core.error({
        code: ERROR_CODE.INVALID_ARGUMENT,
        message: `Allowance less then amount. Required to populate approve for ${props.token}`,
      });
    }
  }

  @Logger('Call:')
  @ErrorHandler()
  public async burn(props: BurnProps) {
    await this._validateAllowance(props);

    if (props.token === 'wsteth') {
      return this._burnWstETH(props);
    } else if (props.token === 'steth') {
      return this._burnStETH(props);
    }

    throw new Error('Unsupported token');
  }

  private async _burnStETH(props: BurnProps) {
    const parsedProps = await this.parseProps(props);

    return this.bus.core.performTransaction({
      ...parsedProps,
      getGasLimit: (options) =>
        parsedProps.dashboard.estimateGas.burnStETH([props.amount], options),
      sendTransaction: (options) =>
        parsedProps.dashboard.write.burnStETH([props.amount], options),
    });
  }

  private async _burnWstETH(props: BurnProps) {
    const parsedProps = await this.parseProps(props);

    return this.bus.core.performTransaction({
      ...parsedProps,
      getGasLimit: (options) =>
        parsedProps.dashboard.estimateGas.burnWstETH([props.amount], options),
      sendTransaction: (options) =>
        parsedProps.dashboard.write.burnWstETH([props.amount], options),
    });
  }

  @Logger('Call:')
  @ErrorHandler()
  public async burnSimulateTx(props: BurnProps) {
    if (props.token === 'wsteth') {
      return this._burnWstETHSimulateTx(props);
    } else if (props.token === 'steth') {
      return this._burnStETHSimulateTx(props);
    }

    throw new Error('Unsupported token');
  }

  @Logger('Call:')
  @ErrorHandler()
  private async _burnStETHSimulateTx(props: BurnProps) {
    const parsedProps = await this.parseProps(props);

    return await parsedProps.dashboard.simulate.burnStETH([props.amount], {
      account: parsedProps.account,
    });
  }

  @Logger('Call:')
  @ErrorHandler()
  private async _burnWstETHSimulateTx(props: BurnProps) {
    const parsedProps = await this.parseProps(props);

    return await parsedProps.dashboard.simulate.burnWstETH([props.amount], {
      account: parsedProps.account,
    });
  }

  @Logger('Utils:')
  @ErrorHandler()
  public async burnPopulateTx(props: BurnProps) {
    this._validateToken(props.token);

    const parsedProps = await this.parseProps(props);
    const functionName = props.token === 'steth' ? 'burnStETH' : 'burnWstETH';

    return {
      from: parsedProps.account.address,
      to: parsedProps.dashboard.address,
      data: encodeFunctionData({
        abi: parsedProps.dashboard.abi,
        functionName,
        args: [props.amount],
      }),
    };
  }

  private async _validateRoles(roles: Array<{ account: Address; role: Hash }>) {
    const ROLES = await this.bus.constants.ROLES();
    for (const role of roles) {
      if (!Object.values(ROLES).includes(role.role)) {
        throw this.bus.core.error({
          code: ERROR_CODE.TRANSACTION_ERROR,
          message: `Invalid role "${role.role}" found.`,
        });
      }
    }
  }

  // set role methods
  @Logger('Call:')
  @ErrorHandler()
  public async grantRoles(props: SetRolesProps) {
    await this._validateRoles(props.roles);
    const parsedProps = await this.parseProps(props);

    return this.bus.core.performTransaction({
      ...parsedProps,
      getGasLimit: (options) =>
        parsedProps.dashboard.estimateGas.grantRoles([props.roles], options),
      sendTransaction: (options) =>
        parsedProps.dashboard.write.grantRoles([props.roles], options),
    });
  }

  @Logger('Call:')
  @ErrorHandler()
  public async grantRolesSimulateTx(props: SetRolesProps) {
    await this._validateRoles(props.roles);
    const parsedProps = await this.parseProps(props);

    return parsedProps.dashboard.simulate.grantRoles([props.roles], {
      account: parsedProps.account,
    });
  }

  @Logger('Utils:')
  @ErrorHandler()
  public async grantRolesPopulateTx(props: SetRolesProps) {
    await this._validateRoles(props.roles);
    const parsedProps = await this.parseProps(props);

    return {
      from: parsedProps.account.address,
      to: parsedProps.dashboard.address,
      data: encodeFunctionData({
        abi: parsedProps.dashboard.abi,
        functionName: 'grantRoles',
        args: [props.roles],
      }),
    };
  }

  // set role methods
  @Logger('Call:')
  @ErrorHandler()
  public async revokeRoles(props: SetRolesProps) {
    await this._validateRoles(props.roles);
    const parsedProps = await this.parseProps(props);

    return this.bus.core.performTransaction({
      ...parsedProps,
      getGasLimit: (options) =>
        parsedProps.dashboard.estimateGas.revokeRoles([props.roles], options),
      sendTransaction: (options) =>
        parsedProps.dashboard.write.revokeRoles([props.roles], options),
    });
  }

  @Logger('Call:')
  @ErrorHandler()
  public async revokeRolesSimulateTx(props: SetRolesProps) {
    await this._validateRoles(props.roles);
    const parsedProps = await this.parseProps(props);

    return parsedProps.dashboard.simulate.revokeRoles([props.roles], {
      account: parsedProps.account,
    });
  }

  @Logger('Utils:')
  @ErrorHandler()
  public async revokeRolesPopulateTx(props: SetRolesProps) {
    await this._validateRoles(props.roles);
    const parsedProps = await this.parseProps(props);

    return {
      from: parsedProps.account.address,
      to: parsedProps.dashboard.address,
      data: encodeFunctionData({
        abi: parsedProps.dashboard.abi,
        functionName: 'revokeRoles',
        args: [props.roles],
      }),
    };
  }

  // disburseNodeOperatorFee methods
  @Logger('Call:')
  @ErrorHandler()
  public async disburseNodeOperatorFee(props: CommonTransactionProps) {
    const parsedProps = await this.parseProps(props);

    return this.bus.core.performTransaction({
      ...parsedProps,
      getGasLimit: (options) =>
        parsedProps.dashboard.estimateGas.disburseFee(options),
      sendTransaction: (options) =>
        parsedProps.dashboard.write.disburseFee(options),
    });
  }

  @Logger('Call:')
  @ErrorHandler()
  public async disburseNodeOperatorFeeSimulateTx(
    props: CommonTransactionProps,
  ) {
    const parsedProps = await this.parseProps(props);

    return parsedProps.dashboard.simulate.disburseFee({
      account: parsedProps.account,
    });
  }

  @Logger('Utils:')
  @ErrorHandler()
  public async disburseNodeOperatorFeePopulateTx(
    props: CommonTransactionProps,
  ) {
    const parsedProps = await this.parseProps(props);

    return {
      from: parsedProps.account.address,
      to: parsedProps.dashboard.address,
      data: encodeFunctionData({
        abi: parsedProps.dashboard.abi,
        functionName: 'disburseFee',
        args: [],
      }),
    };
  }

  @Logger('Call:')
  @ErrorHandler()
  async submitLatestReport(props: VaultSubmitReportProps) {
    return this.bus.lazyOracle.submitLatestReport({
      ...props,
      vaultAddress: this.vaultAddress,
    });
  }

  @Logger('Call:')
  @ErrorHandler()
  async submitLatestReportSimulateTx(props: VaultSubmitReportProps) {
    return this.bus.lazyOracle.submitLatestReportSimulateTx({
      ...props,
      vaultAddress: this.vaultAddress,
    });
  }

  @Logger('Utils:')
  @ErrorHandler()
  async submitLatestReportPopulateTx(props: VaultSubmitReportProps) {
    return this.bus.lazyOracle.submitLatestReportPopulateTx({
      ...props,
      vaultAddress: this.vaultAddress,
    });
  }

  @Logger('Views:')
  @ErrorHandler()
  public async getRoleMembers(props: GetVaultRoleMembersProps) {
    const address = await this.getDashboardAddress();
    const dashboardContract =
      await this.bus.contracts.getContractVaultDashboard(address);
    return dashboardContract.read.getRoleMembers([props.role]);
  }

  @Logger('Utils:')
  @ErrorHandler()
  private async isDashboard(address: Address) {
    const dashboardCode = await this.bus.core.rpcProvider.getCode({ address });
    const vaultFactory = await this.bus.contracts.getContractVaultFactory();
    const implementation = await vaultFactory.read.DASHBOARD_IMPL();
    const proxyCode =
      PROXY_CODE_PAD_LEFT +
      implementation.slice(2).toLowerCase() +
      PROXY_CODE_PAD_RIGHT;

    return dashboardCode?.startsWith(proxyCode) || false;
  }

  @Logger('Views:')
  @ErrorHandler()
  public async getLatestReport(props?: GetLatestVaultReportProps) {
    const vaultAddress = this.getVaultAddress();
    const [lazyOracle, hub] = await Promise.all([
      this.bus.contracts.getContractLazyOracle(),
      this.bus.contracts.getContractVaultHub(),
    ]);

    const [latestVaultReport, latestHubReport] = await Promise.all([
      hub.read.latestReport([vaultAddress]),
      lazyOracle.read.latestReportData(),
    ]);

    const latestHubReportTimestamp = latestHubReport[0];
    const latestHubReportCID = latestHubReport[3];

    const isReportAvailable =
      latestHubReportTimestamp > latestVaultReport.timestamp;

    const report = latestHubReportCID
      ? await getVaultReport({
          cid: latestHubReportCID,
          vault: vaultAddress,
          ...props,
        })
      : null;

    return { report, isReportAvailable };
  }

  @Logger('Views:')
  @ErrorHandler()
  public async getVaultOverviewData(
    props: GetVaultOverviewDataProps,
  ): Promise<VaultOverviewData> {
    const vaultAddress = this.getVaultAddress();
    const blockNumber =
      props.blockNumber ??
      (await this.bus.core.toBlockNumber({ block: 'latest' }));
    const report = props.report ?? (await this.getLatestReport()).report?.data;

    const [
      dashboard,
      vaultContract,
      hub,
      operatorGrid,
      lazyOracle,
      lidoContract,
      // eslint-disable-next-line @typescript-eslint/await-thenable
    ] = await Promise.all([
      this.getDashboardContract(),
      this.getVaultContract(),
      this.bus.contracts.getContractVaultHub(),
      this.bus.contracts.getContractOperatorGrid(),
      this.bus.contracts.getContractLazyOracle(),
      this.bus.core.getLidoContract(),
    ]);

    const nodeOperator = await vaultContract.read.nodeOperator();
    const withdrawalCredentials =
      await vaultContract.read.withdrawalCredentials();
    const vaultConnection = await hub.read.vaultConnection([vaultAddress]);

    const reportLiabilityShares =
      typeof report?.liabilityShares === 'string'
        ? BigInt(report?.liabilityShares)
        : report?.liabilityShares ?? 0n;

    const [
      balance,
      totalValue,
      nodeOperatorUnclaimedFee,
      withdrawableEther,
      feeRate,
      totalMintingCapacityShares,
      mintableShares,
      tier,
      group,
      vaultQuarantineState,
      obligationsShortfallValue,
      [sharesToBurn, feesToSettle],
      rebalanceShares,
      vaultRecord,
      lockedEth,
      stagedBalanceWei,
      beaconChainDepositsPaused,
      // eslint-disable-next-line @typescript-eslint/await-thenable
    ] = await this.bus.readWithLatestReport({
      vaultAddress,
      blockNumber,
      preparedMethods: [
        {
          abi: Multicall3AbiUtils,
          address: this.bus.core.rpcProvider.chain?.contracts?.multicall3
            ?.address as Address,
          functionName: 'getEthBalance',
          args: [vaultAddress],
        },
        dashboard.prepare.totalValue(),
        dashboard.prepare.accruedFee(),
        dashboard.prepare.withdrawableValue(),
        dashboard.prepare.feeRate(),
        dashboard.prepare.totalMintingCapacityShares(),
        dashboard.prepare.remainingMintingCapacityShares([0n]),
        operatorGrid.prepare.vaultTierInfo([vaultAddress]),
        operatorGrid.prepare.group([nodeOperator]),
        lazyOracle.prepare.vaultQuarantine([vaultAddress]),
        dashboard.prepare.obligationsShortfallValue(),
        dashboard.prepare.obligations(),
        hub.prepare.healthShortfallShares([vaultAddress]),
        hub.prepare.vaultRecord([vaultAddress]),
        hub.prepare.locked([vaultAddress]),
        vaultContract.prepare.stagedBalance(),
        vaultContract.prepare.beaconChainDepositsPaused(),
      ] as const,
    });

    // split call because of TS2589: Type instantiation is excessively deep and possibly infinite
    const [isVaultConnected, isPendingDisconnect, vaultOwner] =
      // eslint-disable-next-line @typescript-eslint/await-thenable
      await this.bus.readWithLatestReport({
        vaultAddress,
        blockNumber,
        preparedMethods: [
          hub.prepare.isVaultConnected([vaultAddress]),
          hub.prepare.isPendingDisconnect([vaultAddress]),
          vaultContract.prepare.owner(),
        ] as const,
      });

    const {
      liabilityShares,
      inOutDelta: inOutDeltaArray,
      settledLidoFees,
      cumulativeLidoFees,
      redemptionShares,
      ...restVaultRecord
    } = vaultRecord;

    const inOutDelta = inOutDeltaArray[1].value;
    const [, tierId, tierShareLimit] = tier;
    const { shareLimit: groupShareLimit } = group;

    const [
      liabilityStETH,
      mintableStETH,
      stETHLimit,
      totalMintingCapacityStETH,
      tierStETHLimit,
      stETHToBurn,
      rebalanceStETH,
      redemptionStETH,
      reportLiabilitySharesStETH,
      lidoTVLSharesLimit,
      // eslint-disable-next-line @typescript-eslint/await-thenable
    ] = await Promise.all([
      lidoContract.read.getPooledEthBySharesRoundUp([liabilityShares]),
      lidoContract.read.getPooledEthByShares([mintableShares]),
      lidoContract.read.getPooledEthByShares([vaultConnection.shareLimit]),
      lidoContract.read.getPooledEthByShares([totalMintingCapacityShares]),
      lidoContract.read.getPooledEthByShares([tierShareLimit]),
      lidoContract.read.getPooledEthBySharesRoundUp([sharesToBurn]),
      lidoContract.read.getPooledEthBySharesRoundUp([rebalanceShares]),
      lidoContract.read.getPooledEthBySharesRoundUp([redemptionShares]),
      lidoContract.read.getPooledEthBySharesRoundUp([reportLiabilityShares]),
      lidoContract.read.getMaxMintableExternalShares(),
    ]);

    const supposedDashboardAddress =
      vaultConnection.owner !== zeroAddress
        ? vaultConnection.owner
        : vaultOwner;
    const isDashboard = await this.isDashboard(supposedDashboardAddress);

    return {
      address: vaultAddress,
      nodeOperator,
      totalValue,
      liabilityStETH,
      mintableStETH,
      mintableShares,
      stETHLimit,
      totalMintingCapacityShares,
      totalMintingCapacityStETH,
      inOutDelta,
      nodeOperatorUnclaimedFee,
      withdrawableEther,
      balance,
      reportLiabilitySharesStETH,
      feeRate,
      liabilityShares,
      withdrawalCredentials,
      settledLidoFees,
      cumulativeLidoFees,
      vaultQuarantineState,
      lockedEth,
      tierId,
      tierShareLimit,
      tierStETHLimit,
      lidoTVLSharesLimit,
      groupShareLimit,
      stagedBalanceWei,
      obligationsShortfallValue,
      stETHToBurn,
      feesToSettle,
      rebalanceShares,
      rebalanceStETH,
      redemptionShares,
      redemptionStETH,
      beaconChainDepositsPaused,
      isVaultConnected,
      isPendingDisconnect,
      isVaultDisconnected: !isDashboard,
      ...vaultConnection,
      ...restVaultRecord,
    };
  }

  @Logger('Utils:')
  @ErrorHandler()
  public calculateOverview(args: OverviewArgs) {
    const BASIS_POINTS = 10_000n;
    const {
      totalValue,
      reserveRatioBP,
      liabilitySharesInStethWei,
      forceRebalanceThresholdBP,
      withdrawableEther,
      balance,
      locked,
      nodeOperatorDisbursableFee,
      totalMintingCapacityStethWei,
      unsettledLidoFees,
      minimalReserve,
      reportLiabilitySharesStETH,
    } = args;

    const { healthRatio, isHealthy } = calculateHealth({
      totalValue,
      liabilitySharesInStethWei,
      forceRebalanceThresholdBP,
    });
    const availableToWithdrawal = withdrawableEther;
    const idleCapital = balance;
    const totalLocked = locked + nodeOperatorDisbursableFee + unsettledLidoFees;
    const RR = BigInt(reserveRatioBP);
    const oneMinusRR = BASIS_POINTS - RR;
    const collateral = bigIntMax(
      minimalReserve,
      bigIntCeilDiv(liabilitySharesInStethWei * BASIS_POINTS, oneMinusRR),
    );
    const recentlyRepaid = bigIntMax(
      0n,
      reportLiabilitySharesStETH - liabilitySharesInStethWei,
    );

    const reservedByFormula =
      oneMinusRR === 0n
        ? 0n
        : bigIntCeilDiv(liabilitySharesInStethWei * BASIS_POINTS, oneMinusRR) -
          liabilitySharesInStethWei;
    const reserved = bigIntMin(
      totalValue - liabilitySharesInStethWei,
      reservedByFormula,
    );

    // Prevent division by 0
    const utilizationRatio =
      totalMintingCapacityStethWei === 0n
        ? 0
        : Number(
            ((liabilitySharesInStethWei * BASIS_POINTS) /
              totalMintingCapacityStethWei) *
              100n,
          ) / Number(BASIS_POINTS);

    return {
      healthRatio,
      isHealthy,
      availableToWithdrawal,
      idleCapital,
      totalLocked,
      collateral,
      recentlyRepaid,
      utilizationRatio,
      reserved,
      totalMintingCapacityStethWei,
    };
  }
}

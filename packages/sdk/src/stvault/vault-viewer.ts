import { Address, Hash } from 'viem';
import {
  FetchVaultsByOwnerProps,
  FetchVaultsEntitiesResult,
  FetchVaultsProps,
  FetchVaultsResult,
  GetRoleMembersBatchProps,
  GetRoleMembersProps,
  GetVaultDataProps,
} from './types.js';
import { BusModule } from './bus-module.js';
import { ERROR_CODE } from '../common/index.js';
import { SCAN_LIMIT } from './consts/index.js';

export class LidoSDKVaultViewer extends BusModule {
  public async fetchConnectedVaults(
    props: FetchVaultsProps,
  ): Promise<FetchVaultsResult> {
    const vaultViewer = await this.bus.contracts.getContractVaultViewer();

    const offset = BigInt(props.perPage * (props.page - 1));
    const limit = BigInt(props.perPage);

    const totalVaults = await vaultViewer.read.vaultsCount();
    const vaultAddresses = await vaultViewer.read.vaultAddressesBatch([
      offset,
      limit,
    ]);

    return { data: vaultAddresses as Address[], totals: totalVaults };
  }

  public async fetchVaultsByOwner(props: FetchVaultsByOwnerProps) {
    if (!props.address) {
      throw this.bus.core.error({
        code: ERROR_CODE.INVALID_ARGUMENT,
        message: `Address is required argument`,
      });
    }

    const vaultViewer = await this.bus.contracts.getContractVaultViewer();
    const scanLimit = props.scanLimit ?? SCAN_LIMIT;
    const totalVaults = await vaultViewer.read.vaultsCount();
    let vaults: Address[] = [];

    for (let i = 0n; i < totalVaults; i += scanLimit) {
      const vaultsBatch = await vaultViewer.read.vaultsByOwnerBatch([
        props.address,
        i,
        scanLimit,
      ]);
      vaults = vaults.concat(vaultsBatch);
    }

    return {
      data: vaults,
      totals: vaults.length,
    };
  }

  public async fetchVaultsByOwnerEntities(props: FetchVaultsByOwnerProps) {
    const result = await this.fetchVaultsByOwner(props);

    return {
      data: result.data.map((v) => this.bus.vaultFromAddress(v)),
      totals: result.totals,
    };
  }

  public async fetchConnectedVaultEntities(
    props: FetchVaultsProps,
  ): Promise<FetchVaultsEntitiesResult> {
    const result = await this.fetchConnectedVaults(props);

    return {
      data: result.data.map((v) => this.bus.vaultFromAddress(v)),
      totals: result.totals,
    };
  }

  private async _validateRoles(roles: Hash[]) {
    const ROLES = await this.bus.constants.ROLES();

    for (const role of roles) {
      if (!Object.values(ROLES).includes(role)) {
        throw this.bus.core.error({
          code: ERROR_CODE.TRANSACTION_ERROR,
          message: `Invalid role "${role}" found.`,
        });
      }
    }
  }

  public async getRoleMembers(props: GetRoleMembersProps) {
    await this._validateRoles(props.roles);
    const vaultViewer = await this.bus.contracts.getContractVaultViewer();

    return vaultViewer.read.roleMembers([props.vaultAddress, props.roles]);
  }

  public async getRoleMembersBatch(props: GetRoleMembersBatchProps) {
    await this._validateRoles(props.roles);
    const vaultViewer = await this.bus.contracts.getContractVaultViewer();

    return vaultViewer.read.roleMembersBatch([
      props.vaultAddresses,
      props.roles,
    ]);
  }

  public async getVaultData(props: GetVaultDataProps) {
    const vaultViewer = await this.bus.contracts.getContractVaultViewer();

    return vaultViewer.read.vaultData([props.vaultAddress]);
  }
}

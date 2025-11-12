import { Address, Hash } from 'viem';
import {
  FetchVaultsEntitiesResult,
  FetchVaultsProps,
  FetchVaultsResult,
  GetRoleMembersBatchProps,
  GetRoleMembersProps,
  GetVaultDataProps,
} from './types.js';
import { BusModule } from './bus-module.js';
import { ERROR_CODE } from '../common/index.js';

export class LidoSDKVaultViewer extends BusModule {
  public async fetchConnectedVaults(
    props: FetchVaultsProps,
  ): Promise<FetchVaultsResult> {
    const vaultViewer = await this.bus.contracts.getContractVaultViewer();
    const account = props.account
      ? await this.bus.core.useAccount(props.account)
      : null;

    const offset = BigInt(props.perPage * (props.page - 1));
    const limit = BigInt(props.perPage);

    const vaultAddresses = await (account
      ? vaultViewer.read.vaultsByOwnerBatch([account.address, offset, limit])
      : vaultViewer.read.vaultAddressesBatch([offset, limit]));

    return vaultAddresses as Address[];
  }

  public async fetchConnectedVaultEntities(
    props: FetchVaultsProps,
  ): Promise<FetchVaultsEntitiesResult> {
    const vaults = await this.fetchConnectedVaults(props);

    return vaults.map((v) => this.bus.vaultFromAddress(v));
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

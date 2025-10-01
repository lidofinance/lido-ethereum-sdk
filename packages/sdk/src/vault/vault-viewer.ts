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
import { validateRole } from './consts/roles.js';
import { ERROR_CODE } from '../common/index.js';

export class LidoSDKVaultViewer extends BusModule {
  public async fetchConnectedVaults(
    props: FetchVaultsProps,
  ): Promise<FetchVaultsResult> {
    const vaultViewer = await this.bus.contracts.getContractVaultViewer();
    const account = props.account
      ? await this.bus.core.useAccount(props.account)
      : null;

    const fromCursor = BigInt(props.perPage * (props.page - 1));
    const toCursor = BigInt(props.page * props.perPage);

    const [vaultAddresses, leftOver] = await (account
      ? vaultViewer.read.vaultsByOwnerBound([
          account.address,
          fromCursor,
          toCursor,
        ])
      : vaultViewer.read.vaultsConnectedBound([fromCursor, toCursor]));

    const totalVaultsCount =
      Number(fromCursor) + vaultAddresses.length + Number(leftOver);

    return {
      data: vaultAddresses as Address[],
      total: totalVaultsCount,
    };
  }

  public async fetchConnectedVaultEntities(
    props: FetchVaultsProps,
  ): Promise<FetchVaultsEntitiesResult> {
    const { data, total } = await this.fetchConnectedVaults(props);

    return {
      data: data.map((v) => this.bus.vaultFromAddress(v)),
      total,
    };
  }

  private _validateRoles(roles: Hash[]) {
    for (const role of roles) {
      if (!validateRole(role)) {
        throw this.bus.core.error({
          code: ERROR_CODE.TRANSACTION_ERROR,
          message: `Invalid role "${role}" found.`,
        });
      }
    }
  }

  public async getRoleMembers(props: GetRoleMembersProps) {
    this._validateRoles(props.roles);
    const vaultViewer = await this.bus.contracts.getContractVaultViewer();

    return vaultViewer.read.getRoleMembers([props.vaultAddress, props.roles]);
  }

  public async getRoleMembersBatch(props: GetRoleMembersBatchProps) {
    this._validateRoles(props.roles);
    const vaultViewer = await this.bus.contracts.getContractVaultViewer();

    return vaultViewer.read.getRoleMembersBatch([
      props.vaultAddresses,
      props.roles,
    ]);
  }

  public async getVaultData(props: GetVaultDataProps) {
    const vaultViewer = await this.bus.contracts.getContractVaultViewer();

    return vaultViewer.read.getVaultData([props.vaultAddress]);
  }
}

import { Address } from 'viem';
import {
  FetchVaultsEntitiesResult,
  FetchVaultsProps,
  FetchVaultsResult,
} from './types.js';
import { BusModule } from './bus-module.js';

export class LidoSDKVaultViewer extends BusModule {
  public async fetchConnectedVaults(
    params: FetchVaultsProps,
  ): Promise<FetchVaultsResult> {
    const vaultViewer = await this.bus.contracts.getContractVaultViewer();
    const account = params.account
      ? await this.bus.core.useAccount(params.account)
      : null;

    const fromCursor = BigInt(params.perPage * (params.page - 1));
    const toCursor = BigInt(params.page * params.perPage);

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
    params: FetchVaultsProps,
  ): Promise<FetchVaultsEntitiesResult> {
    const { data, total } = await this.fetchConnectedVaults(params);

    return {
      data: data.map((v) => this.bus.vaultFromAddress(v)),
      total,
    };
  }
}

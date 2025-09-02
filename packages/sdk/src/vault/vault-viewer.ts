import { LidoSDKModule } from '../common/class-primitives/sdk-module.js';
import { Cache, Logger } from '../common/decorators/index.js';
import {
  Address,
  getContract,
  GetContractReturnType,
  WalletClient,
} from 'viem';
import { VaultViewerAbi } from './abi/index.js';
import { vaultsAddresses } from './consts/vaults-addresses.js';
import { FetchVaultsProps, FetchVaultsResult } from './types.js';

export class LidoSDKVaultViewer extends LidoSDKModule {
  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, [])
  public async getContractVaultViewer(): Promise<
    GetContractReturnType<typeof VaultViewerAbi, WalletClient>
  > {
    const address = vaultsAddresses.vaultViewer;

    return getContract({
      address,
      abi: VaultViewerAbi,
      client: {
        public: this.core.rpcProvider,
        wallet: this.core.web3Provider as WalletClient,
      },
    });
  }

  public async fetchConnectedVaults(
    params: FetchVaultsProps,
  ): Promise<FetchVaultsResult> {
    const vaultViewer = await this.getContractVaultViewer();
    const account = params.account
      ? await this.core.useAccount(params.account)
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
}

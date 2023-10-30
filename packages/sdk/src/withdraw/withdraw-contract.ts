import { getContract } from 'viem';
import {
  type Address,
  type GetContractReturnType,
  type PublicClient,
  type WalletClient,
} from 'viem';
import { Logger, Cache } from '../common/decorators/index.js';
import { LIDO_CONTRACT_NAMES } from '../common/constants.js';

import { WithdrawalQueueAbi } from './abi/withdrawalQueue.js';
import { PartStethAbi } from './abi/partStETH.js';
import { PartWstethAbi } from './abi/partWstETH.js';
import { BusModule } from './bus-module.js';

export class LidoSDKWithdrawContract extends BusModule {
  // Contracts

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['bus.core.chain.id'])
  public async contractAddressWithdrawalQueue(): Promise<Address> {
    return await this.bus.core.getContractAddress(
      LIDO_CONTRACT_NAMES.withdrawalQueue,
    );
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, [
    'bus.core.chain.id',
    'contractAddressWithdrawalQueue',
  ])
  public async getContractWithdrawalQueue(): Promise<
    GetContractReturnType<typeof WithdrawalQueueAbi, PublicClient, WalletClient>
  > {
    const address = await this.contractAddressWithdrawalQueue();

    return getContract({
      address,
      abi: WithdrawalQueueAbi,
      publicClient: this.bus.core.rpcProvider,
      walletClient: this.bus.core.web3Provider,
    });
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['bus.core.chain.id'])
  public async contractAddressStETH(): Promise<Address> {
    return await this.bus.core.getContractAddress(LIDO_CONTRACT_NAMES.lido);
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['bus.core.chain.id', 'contractAddressStETH'])
  public async getContractStETH(): Promise<
    GetContractReturnType<typeof PartStethAbi, PublicClient, WalletClient>
  > {
    const address = await this.contractAddressStETH();

    return getContract({
      address,
      abi: PartStethAbi,
      publicClient: this.bus.core.rpcProvider,
      walletClient: this.bus.core.web3Provider,
    });
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['bus.core.chain.id'])
  public async contractAddressWstETH(): Promise<Address> {
    return await this.bus.core.getContractAddress(LIDO_CONTRACT_NAMES.wsteth);
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['bus.core.chain.id', 'contractAddressWstETH'])
  public async getContractWstETH(): Promise<
    GetContractReturnType<typeof PartWstethAbi, PublicClient, WalletClient>
  > {
    const address = await this.contractAddressWstETH();

    return getContract({
      address,
      abi: PartWstethAbi,
      publicClient: this.bus.core.rpcProvider,
      walletClient: this.bus.core.web3Provider,
    });
  }
}

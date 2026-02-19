import { getContract } from 'viem';
import type { Address, GetContractReturnType, WalletClient } from 'viem';
import { Logger, Cache } from '../common/decorators/index.js';
import { LIDO_CONTRACT_NAMES } from '../common/constants.js';
import { EncodableContract, getEncodableContract } from '../common/index.js';

import { BusModule } from './bus-module.js';

import {
  WithdrawalQueueAbi,
  type WithdrawalQueueAbiType,
} from './abi/withdrawalQueue.js';
import { PartStethAbi, type PartStethAbiType } from './abi/partStETH.js';
import { PartWstethAbi, type PartWstethAbiType } from './abi/partWstETH.js';

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
    EncodableContract<
      GetContractReturnType<WithdrawalQueueAbiType, WalletClient>
    >
  > {
    const address = await this.contractAddressWithdrawalQueue();

    return getEncodableContract(
      getContract({
        address,
        abi: WithdrawalQueueAbi,
        client: {
          public: this.bus.core.rpcProvider,
          wallet: this.bus.core.web3Provider as WalletClient,
        },
      }),
    );
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['bus.core.chain.id'])
  public async contractAddressStETH(): Promise<Address> {
    return await this.bus.core.getContractAddress(LIDO_CONTRACT_NAMES.lido);
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['bus.core.chain.id', 'contractAddressStETH'])
  public async getContractStETH(): Promise<
    EncodableContract<GetContractReturnType<PartStethAbiType, WalletClient>>
  > {
    const address = await this.contractAddressStETH();

    return getEncodableContract(
      getContract({
        address,
        abi: PartStethAbi,
        client: {
          public: this.bus.core.rpcProvider,
          wallet: this.bus.core.web3Provider as WalletClient,
        },
      }),
    );
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['bus.core.chain.id'])
  public async contractAddressWstETH(): Promise<Address> {
    return await this.bus.core.getContractAddress(LIDO_CONTRACT_NAMES.wsteth);
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['bus.core.chain.id', 'contractAddressWstETH'])
  public async getContractWstETH(): Promise<
    EncodableContract<GetContractReturnType<PartWstethAbiType, WalletClient>>
  > {
    const address = await this.contractAddressWstETH();

    return getEncodableContract(
      getContract({
        address,
        abi: PartWstethAbi,
        client: {
          public: this.bus.core.rpcProvider,
          wallet: this.bus.core.web3Provider as WalletClient,
        },
      }),
    );
  }
}

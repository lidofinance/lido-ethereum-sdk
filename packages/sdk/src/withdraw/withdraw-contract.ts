import { getContract } from 'viem';
import type { Address } from 'viem';
import { Logger, Cache } from '../common/decorators/index.js';
import { LIDO_CONTRACT_NAMES } from '../common/constants.js';
import { getEncodableContract } from '../common/index.js';

import { BusModule } from './bus-module.js';

import { WithdrawalQueueAbi } from './abi/withdrawalQueue.js';
import { PartStethAbi } from './abi/partStETH.js';
import { PartWstethAbi } from './abi/partWstETH.js';
import {
  PartialWstethContractType,
  PartialStethContractType,
  WithdrawalQueueContractType,
} from './types.js';

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
  public async getContractWithdrawalQueue(): Promise<WithdrawalQueueContractType> {
    const address = await this.contractAddressWithdrawalQueue();

    return getEncodableContract(
      getContract({
        address,
        abi: WithdrawalQueueAbi,
        client: this.bus.core.keyedClient,
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
  public async getContractStETH(): Promise<PartialStethContractType> {
    const address = await this.contractAddressStETH();

    return getEncodableContract(
      getContract({
        address,
        abi: PartStethAbi,
        client: this.bus.core.keyedClient,
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
  public async getContractWstETH(): Promise<PartialWstethContractType> {
    const address = await this.contractAddressWstETH();

    return getEncodableContract(
      getContract({
        address,
        abi: PartWstethAbi,
        client: this.bus.core.keyedClient,
      }),
    );
  }
}

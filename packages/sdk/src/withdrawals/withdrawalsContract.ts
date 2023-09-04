import { getContract } from 'viem';
import {
  type Address,
  type GetContractReturnType,
  type PublicClient,
  type WalletClient,
} from 'viem';
import invariant from 'tiny-invariant';

import { LidoSDKCore } from '../core/index.js';
import { Logger, Cache } from '../common/decorators/index.js';
import { LIDO_CONTRACT_NAMES } from '../common/constants.js';
import { version } from '../version.js';

import { WithdrawalsQueueAbi } from './abi/withdrawalsQueue.js';
import { PartStethAbi } from './abi/partStETH.js';
import { PartWstethAbi } from './abi/partWstETH.js';
import { type LidoSDKWithdrawalsContractProps } from './types.js';

export class LidoSDKWithdrawalsContract {
  readonly core: LidoSDKCore;

  constructor(props: LidoSDKWithdrawalsContractProps) {
    const { core, ...rest } = props;

    if (core) this.core = core;
    else this.core = new LidoSDKCore(rest, version);
  }

  // Contracts

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['core.chain.id'])
  public async contractAddressWithdrawalsQueue(): Promise<Address> {
    invariant(this.core.chain, 'Chain is not defined');

    return await this.core.getContractAddress(
      LIDO_CONTRACT_NAMES.withdrawalQueue,
    );
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['core.chain.id', 'contractAddressWithdrawalsQueue'])
  public async getContractWithdrawalsQueue(): Promise<
    GetContractReturnType<
      typeof WithdrawalsQueueAbi,
      PublicClient,
      WalletClient
    >
  > {
    const address = await this.contractAddressWithdrawalsQueue();

    return getContract({
      address,
      abi: WithdrawalsQueueAbi,
      publicClient: this.core.rpcProvider,
      walletClient: this.core.web3Provider,
    });
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['core.chain.id'])
  public async contractAddressStETH(): Promise<Address> {
    invariant(this.core.chain, 'Chain is not defined');

    return await this.core.getContractAddress(LIDO_CONTRACT_NAMES.lido);
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['core.chain.id', 'contractAddressStETH'])
  public async getContractStETH(): Promise<
    GetContractReturnType<typeof PartStethAbi, PublicClient, WalletClient>
  > {
    const address = await this.contractAddressStETH();

    return getContract({
      address,
      abi: PartStethAbi,
      publicClient: this.core.rpcProvider,
      walletClient: this.core.web3Provider,
    });
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['core.chain.id'])
  public async contractAddressWstETH(): Promise<Address> {
    invariant(this.core.chain, 'Chain is not defined');

    return await this.core.getContractAddress(LIDO_CONTRACT_NAMES.wsteth);
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['core.chain.id', 'contractAddressWstETH'])
  public async getContractWstETH(): Promise<
    GetContractReturnType<typeof PartWstethAbi, PublicClient, WalletClient>
  > {
    const address = await this.contractAddressWstETH();

    return getContract({
      address,
      abi: PartWstethAbi,
      publicClient: this.core.rpcProvider,
      walletClient: this.core.web3Provider,
    });
  }
}

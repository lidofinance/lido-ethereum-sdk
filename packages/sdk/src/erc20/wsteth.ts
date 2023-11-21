import { type Address } from 'viem';

import { Logger, Cache } from '../common/decorators/index.js';
import { LIDO_CONTRACT_NAMES } from '../common/constants.js';

import { AbstractLidoSDKErc20 } from './erc20.js';

export class LidoSDKwstETH extends AbstractLidoSDKErc20 {
  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['core.chain.id'])
  public override contractAddress(): Promise<Address> {
    return this.core.getContractAddress(LIDO_CONTRACT_NAMES.wsteth);
  }

  public override async erc721Domain(): Promise<{
    name: string;
    version: string;
    chainId: bigint;
    verifyingContract: `0x${string}`;
  }> {
    return {
      name: 'Wrapped liquid staked Ether 2.0',
      version: '1',
      chainId: BigInt(this.core.chain.id),
      verifyingContract: await this.contractAddress(),
    };
  }
}

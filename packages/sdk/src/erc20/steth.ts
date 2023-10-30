import { type Address } from 'viem';

import { Logger, Cache } from '../common/decorators/index.js';
import { LIDO_CONTRACT_NAMES } from '../common/constants.js';

import { AbstractLidoSDKErc20 } from './erc20.js';

export class LidoSDKstETH extends AbstractLidoSDKErc20 {
  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['core.chain.id'])
  public override contractAddress(): Promise<Address> {
    return this.core.getContractAddress(LIDO_CONTRACT_NAMES.lido);
  }
}

import { version } from '../version.js';

import { Bus } from './bus.js';
import { LidoSDKWithdrawalsProps } from './types.js';

export class LidoSDKWithdrawals extends Bus {
  constructor(props: LidoSDKWithdrawalsProps) {
    super(props, version);
  }
}

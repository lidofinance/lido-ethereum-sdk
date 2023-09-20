import { version } from '../version.js';

import { Bus } from './bus.js';
import { LidoSDKWithdrawProps } from './types.js';

export class LidoSDKWithdraw extends Bus {
  constructor(props: LidoSDKWithdrawProps) {
    super(props, version);
  }
}

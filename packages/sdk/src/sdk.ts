import { LidoSDKCore, LidoSDKCoreProps } from './core/index.js';
import { LidoSDKStaking } from './staking/index.js';
import { LidoSDKWithdrawals } from './withdrawals/index.js';

import { version } from './version.js';

export class LidoSDK {
  readonly core: LidoSDKCore;
  readonly staking: LidoSDKStaking;
  readonly withdrawals: LidoSDKWithdrawals;

  constructor(props: LidoSDKCoreProps) {
    // Core functionality
    this.core = new LidoSDKCore(props, version);
    // Staking functionality
    this.staking = new LidoSDKStaking({ ...props, core: this.core });
    // Withdrawals functionality
    this.withdrawals = new LidoSDKWithdrawals({ ...props, core: this.core });
  }
}

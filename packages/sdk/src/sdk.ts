import { LidoSDKCore, LidoSDKCoreProps } from './core/index.js';

import { LidoSDKStaking } from './staking/index.js';
import { LidoSDKWrap } from './wrap/index.js';
import { LidoSDKWithdrawals } from './withdrawals/index.js';
import { LidoSDKstETH, LidoSDKwstETH } from './erc20/index.js';

import { version } from './version.js';

export class LidoSDK {
  readonly core: LidoSDKCore;
  readonly staking: LidoSDKStaking;
  readonly wrap: LidoSDKWrap;
  readonly withdrawals: LidoSDKWithdrawals;
  readonly steth: LidoSDKstETH;
  readonly wsteth: LidoSDKwstETH;

  constructor(props: LidoSDKCoreProps) {
    // Core functionality
    this.core = new LidoSDKCore(props, version);
    const core = this.core;
    // Staking functionality
    this.staking = new LidoSDKStaking({ ...props, core });
    // Wrap functionality
    this.wrap = new LidoSDKWrap({ ...props, core });
    // Withdrawals functionality
    this.withdrawals = new LidoSDKWithdrawals({ ...props, core });
    // Tokens functionality
    this.steth = new LidoSDKstETH({ ...props, core });
    this.wsteth = new LidoSDKwstETH({ ...props, core });
  }
}

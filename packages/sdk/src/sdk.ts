import { LidoSDKCore, LidoSDKCoreProps } from './core/index.js';

import { LidoSDKStake } from './stake/index.js';
import { LidoSDKWrap } from './wrap/index.js';
import { LidoSDKWithdraw } from './withdraw/index.js';
import { LidoSDKstETH, LidoSDKwstETH } from './erc20/index.js';
import { LidoSDKUnstETH } from './unsteth/index.js';
import { LidoSDKEvents } from './events/index.js';
import { LidoSDKStatistics } from './statistics/index.js';
import { LidoSDKRewards } from './rewards/index.js';
import { LidoSDKShares } from './shares/shares.js';

import { version } from './version.js';

export class LidoSDK {
  readonly core: LidoSDKCore;
  readonly stake: LidoSDKStake;
  readonly wrap: LidoSDKWrap;
  readonly withdraw: LidoSDKWithdraw;
  readonly steth: LidoSDKstETH;
  readonly wsteth: LidoSDKwstETH;
  readonly shares: LidoSDKShares;
  readonly unsteth: LidoSDKUnstETH;
  readonly events: LidoSDKEvents;
  readonly statistics: LidoSDKStatistics;
  readonly rewards: LidoSDKRewards;

  constructor(props: LidoSDKCoreProps) {
    // Core functionality
    this.core = new LidoSDKCore(props, version);
    const core = this.core;
    // Staking functionality
    this.stake = new LidoSDKStake({ ...props, core });
    // Wrap functionality
    this.wrap = new LidoSDKWrap({ ...props, core });
    // Withdrawals functionality
    this.withdraw = new LidoSDKWithdraw({ ...props, core });
    // Tokens functionality
    this.steth = new LidoSDKstETH({ ...props, core });
    this.wsteth = new LidoSDKwstETH({ ...props, core });
    this.unsteth = new LidoSDKUnstETH({ ...props, core });
    this.shares = new LidoSDKShares({ ...props, core });
    // Events functionality
    this.events = new LidoSDKEvents({ ...props, core });
    // Statistic functionality
    this.statistics = new LidoSDKStatistics({ ...props, core });
    // Rewards functionality
    this.rewards = new LidoSDKRewards({ ...props, core });
  }
}

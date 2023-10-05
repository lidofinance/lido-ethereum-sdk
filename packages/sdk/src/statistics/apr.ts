import invariant from 'tiny-invariant';

import { LidoSDKCore } from '../core/index.js';
import { LidoSDKEvents } from '../events/index.js';
import { Logger, ErrorHandler } from '../common/decorators/index.js';
import { version } from '../version.js';

import type { LidoSDKStatisticsProps } from './types.js';

export class LidoSDKApr {
  readonly core: LidoSDKCore;
  readonly events: LidoSDKEvents;

  constructor(props: LidoSDKStatisticsProps) {
    const { core, ...rest } = props;

    if (core) this.core = core;
    else this.core = new LidoSDKCore(rest, version);

    this.events = new LidoSDKEvents({ ...rest, core: this.core });
  }

  @Logger('Statistic:')
  @ErrorHandler()
  public async getLastApr(): Promise<number> {
    const event = await this.events.stethEvents.getLastRebaseEvent();
    invariant(event, 'event is not defined');

    const apr = this.calculateApr(event.args);

    return apr;
  }

  @Logger('Statistic:')
  @ErrorHandler()
  public async getSmaApr(): Promise<{ aprs: number[]; smaApr: number }> {
    const events = await this.events.stethEvents.getRebaseEventsByDays({
      days: 7,
    });
    invariant(events.length, 'Events is not defined');

    const aprs = events.map((event) => this.calculateApr(event.args));
    const sum = aprs.reduce((acc, apr) => apr + acc, 0);

    return { aprs, smaApr: Number((sum / aprs.length).toFixed(1)) };
  }

  private calculateApr(props: {
    preTotalEther?: bigint;
    preTotalShares?: bigint;
    postTotalEther?: bigint;
    postTotalShares?: bigint;
    timeElapsed?: bigint;
  }): number {
    const {
      preTotalEther,
      preTotalShares,
      postTotalEther,
      postTotalShares,
      timeElapsed,
    } = props;

    invariant(preTotalEther, 'preTotalEther is not defined');
    invariant(preTotalShares, 'preTotalShares is not defined');
    invariant(postTotalEther, 'postTotalEther is not defined');
    invariant(postTotalShares, 'postTotalShares is not defined');
    invariant(timeElapsed, 'timeElapsed is not defined');

    const preShareRate = (preTotalEther * BigInt(10 ** 27)) / preTotalShares;
    const postShareRate = (postTotalEther * BigInt(10 ** 27)) / postTotalShares;
    const mulForPrecision = 1000;

    const secondsInYear = BigInt(31536000);
    const userAPR =
      (secondsInYear *
        ((postShareRate - preShareRate) * BigInt(mulForPrecision))) /
      preShareRate /
      timeElapsed;

    return (Number(userAPR) * 100) / mulForPrecision;
  }
}

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
  public async getSmaApr(props: {
    days: number;
  }): Promise<number> {
    const { days } = props;

    const lastEvent = await this.events.stethEvents.getLastRebaseEvent()
    invariant(lastEvent, 'Last event is not defined')

    const firstEvent = await this.events.stethEvents.getFirstRebaseEvent({
      fromBlock: lastEvent.blockNumber, daysAgo: days
    })
    invariant(firstEvent, 'First event is not defined')

    invariant(firstEvent.args.timeElapsed, 'time elapsed is not defined')
    invariant(lastEvent.args.reportTimestamp, 'Last event reportTimestamp is not defined')
    invariant(firstEvent.args.reportTimestamp, 'First event reportTimestamp is not defined')

    const smaApr = this.calculateApr({
      preTotalEther: firstEvent.args.preTotalEther,
      preTotalShares: firstEvent.args.preTotalShares,
      postTotalEther: lastEvent.args.postTotalEther,
      postTotalShares: lastEvent.args.postTotalShares,
      timeElapsed: firstEvent.args.timeElapsed + (lastEvent.args.reportTimestamp - firstEvent.args.reportTimestamp),
    })

    return smaApr;
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

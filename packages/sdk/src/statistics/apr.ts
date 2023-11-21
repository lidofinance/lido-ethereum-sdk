import { LidoSDKEvents } from '../events/index.js';
import { Logger, ErrorHandler } from '../common/decorators/index.js';

import { ERROR_CODE, invariant } from '../common/utils/sdk-error.js';
import { LidoSDKModule } from '../common/class-primitives/sdk-module.js';
import { LidoSDKCommonProps } from '../core/types.js';

export class LidoSDKApr extends LidoSDKModule {
  readonly events: LidoSDKEvents;

  constructor(props: LidoSDKCommonProps) {
    super(props);

    this.events = new LidoSDKEvents({ ...props, core: this.core });
  }

  public static calculateAprFromRebaseEvent(props: {
    preTotalEther: bigint;
    preTotalShares: bigint;
    postTotalEther: bigint;
    postTotalShares: bigint;
    timeElapsed: bigint;
  }): number {
    const {
      preTotalEther,
      preTotalShares,
      postTotalEther,
      postTotalShares,
      timeElapsed,
    } = props;

    const preShareRate = (preTotalEther * BigInt(10 ** 27)) / preTotalShares;
    const postShareRate = (postTotalEther * BigInt(10 ** 27)) / postTotalShares;
    const mulForPrecision = 1000;

    const secondsInYear = 31536000n;
    const userAPR =
      (secondsInYear *
        ((postShareRate - preShareRate) * BigInt(mulForPrecision))) /
      preShareRate /
      timeElapsed;

    return (Number(userAPR) * 100) / mulForPrecision;
  }

  @Logger('Statistic:')
  @ErrorHandler()
  public async getLastApr(): Promise<number> {
    const event = await this.events.stethEvents.getLastRebaseEvent();
    invariant(event, 'Could not find last Rebase event', ERROR_CODE.READ_ERROR);
    const apr = LidoSDKApr.calculateAprFromRebaseEvent(event.args);

    return apr;
  }

  @Logger('Statistic:')
  @ErrorHandler()
  public async getSmaApr(props: { days: number }): Promise<number> {
    const { days } = props;

    const lastEvent = await this.events.stethEvents.getLastRebaseEvent();
    invariant(
      lastEvent,
      'Could not find last Rebase event',
      ERROR_CODE.READ_ERROR,
    );

    const firstEvent = await this.events.stethEvents.getFirstRebaseEvent({
      days,
      fromBlockNumber: lastEvent.blockNumber,
    });
    invariant(
      firstEvent,
      'Could not locate first Rebase event. Likely days range greatly preceded first firing of the event.',
      ERROR_CODE.READ_ERROR,
    );

    const timeElapsed =
      firstEvent.args.timeElapsed +
      (lastEvent.args.reportTimestamp - firstEvent.args.reportTimestamp);

    const smaApr = LidoSDKApr.calculateAprFromRebaseEvent({
      preTotalEther: firstEvent.args.preTotalEther,
      preTotalShares: firstEvent.args.preTotalShares,
      postTotalEther: lastEvent.args.postTotalEther,
      postTotalShares: lastEvent.args.postTotalShares,
      timeElapsed,
    });

    return smaApr;
  }
}

import { describe, test, expect } from '@jest/globals';
import { expectSDKModule } from '../../../tests/utils/expect/expect-sdk-module.js';
import { AprRebaseEvent, LidoSDKApr, LidoSDKStatistics } from '../../index.js';

import { useStats } from '../../../tests/utils/fixtures/use-stats.js';

const APR_SPEC: Array<[AprRebaseEvent, number]> = [
  [
    {
      timeElapsed: 4608n,
      preTotalShares: 380434172050725886214426n,
      preTotalEther: 381568992239135809181277n,
      postTotalShares: 380434280124073199943710n,
      postTotalEther: 381570076199165808306368n,
    },
    1.7,
  ],
  [
    {
      preTotalEther: 381546767228440793115619n,
      preTotalShares: 380431956104410024720267n,
      postTotalEther: 381570076199165808306368n,
      postTotalShares: 380434280124073199943710n,
      timeElapsed: 96768n,
    },
    1.7,
  ],
  [
    {
      preTotalEther: 381525342519484532036668n,
      preTotalShares: 380429818132108977600266n,
      postTotalEther: 381570076199165808306368n,
      postTotalShares: 380434280124073199943710n,
      timeElapsed: 188928n,
    },
    1.7,
  ],
  [
    {
      postTotalEther: 9214558073511239726258077n,
      postTotalShares: 8015162922459393384526309n,
      preTotalEther: 9263068471084128020814862n,
      preTotalShares: 8066681860242338824295513n,
      timeElapsed: 950400n,
    },
    3.8,
  ],
  [
    {
      postTotalEther: 9214558073511239726258077n,
      postTotalShares: 8015162922459393384526309n,
      preTotalEther: 8394212555328852098606993n,
      preTotalShares: 7381214257921691114069196n,
      timeElapsed: 9244800n,
    },
    3.7,
  ],
  [
    {
      postTotalEther: 1117524237432571389949096n,
      postTotalShares: 941217337772777324482426n,
      preTotalEther: 411807460465253736065963n,
      preTotalShares: 352884611916239405037988n,
      timeElapsed: 12009600n,
    },
    4.5,
  ],
];

describe('LidoSDKStats', () => {
  const { apr } = useStats({ useDirectRpc: true });

  test('is correct module', () => {
    expectSDKModule(LidoSDKStatistics);
    expectSDKModule(LidoSDKApr);
    expect(apr).toBeInstanceOf(LidoSDKApr);
  });

  test('getLastApr', async () => {
    const lastApr = await apr.getLastApr();
    expect(typeof lastApr).toBe('number');
    expect(lastApr).toBeGreaterThan(0);
    expect(lastApr).toBeLessThan(40);
  });

  test.each([[1], [2], [3], [10]])('getSmaApr for %i days', async (days) => {
    const lastApr = await apr.getSmaApr({ days });
    expect(typeof lastApr).toBe('number');
    expect(lastApr).toBeGreaterThan(0);
    expect(lastApr).toBeLessThan(40);
  });

  test.each(APR_SPEC)('calculateAprFromRebaseEvent %#', (props, result) => {
    expect(LidoSDKApr.calculateAprFromRebaseEvent(props)).toBe(result);
  });
});

import { describe, test, expect, beforeAll } from '@jest/globals';
import { expectSDKModule } from '../../../tests/utils/expect/expect-sdk-module.js';
import { LidoSDKEvents } from '../events.js';
import { LidoSDKStethEvents } from '../steth-events.js';
import { useEvents } from '../../../tests/utils/fixtures/use-events.js';
import { LIDO_CONTRACT_NAMES } from '../../index.js';

import { expectRebaseEvent } from '../../../tests/utils/expect/expect-rebase-event.js';

describe('LidoSDKEvents', () => {
  const { stethEvents, core } = useEvents();
  let lidoAddress = '';

  beforeAll(async () => {
    lidoAddress = await core.getContractAddress(LIDO_CONTRACT_NAMES.lido);
  });

  test('is correct module', () => {
    expectSDKModule(LidoSDKEvents);
    expectSDKModule(LidoSDKStethEvents);
    expect(stethEvents).toBeInstanceOf(LidoSDKStethEvents);
  });

  test('getLastRebaseEvent', async () => {
    const event = await stethEvents.getLastRebaseEvent();
    expectRebaseEvent(event, lidoAddress);
  });

  test.each([[1], [2], [3], [10]])(
    'getLastRebaseEvents %i count',
    async (count) => {
      const events = await stethEvents.getLastRebaseEvents({ count });
      expect(events).toHaveLength(count);
      for (const event of events) {
        expectRebaseEvent(event);
      }
      // eslint-disable-next-line sonarjs/no-ignored-return
      events.reduce((rebaseEvent1, rebaseEvent2) => {
        expect(rebaseEvent1.blockNumber).toBeLessThan(rebaseEvent2.blockNumber);
        return rebaseEvent2;
      });
    },
  );

  test.each([500, 5000, 50000])(
    'getLastRebaseEvents %i step',
    async (stepBlock) => {
      const count = 5;
      const events = await stethEvents.getLastRebaseEvents({
        count,
        stepBlock,
      });
      expect(events).toHaveLength(count);
      for (const event of events) {
        expectRebaseEvent(event);
      }
      // eslint-disable-next-line sonarjs/no-ignored-return
      events.reduce((rebaseEvent1, rebaseEvent2) => {
        expect(rebaseEvent1.blockNumber).toBeLessThan(rebaseEvent2.blockNumber);
        return rebaseEvent2;
      });
    },
  );

  test('getRebaseEvents', async () => {
    const events = await stethEvents.getRebaseEvents({
      back: { days: 10n },
      maxCount: 10,
    });
    expect(events).toHaveLength(10);
    for (const event of events) {
      expectRebaseEvent(event);
    }
  });

  test('getRebaseEvents fits range', async () => {
    const todayTimestamp = BigInt(Math.floor(Date.now() / 1000));
    const earlierTimestamp = todayTimestamp - 3600n * 24n * 3n;
    const events = await stethEvents.getRebaseEvents({
      from: { timestamp: earlierTimestamp },
      to: { timestamp: todayTimestamp },
      maxCount: 10,
    });
    expect(events).toHaveLength(10);
    for (const event of events) {
      expectRebaseEvent(event);

      const block = await core.rpcProvider.getBlock({
        blockNumber: event.blockNumber,
      });

      expect(block.timestamp).toBeLessThanOrEqual(todayTimestamp);
      expect(block.timestamp).toBeGreaterThanOrEqual(earlierTimestamp);
    }
  });

  test.each([[1], [2], [10], [20]])(
    'getFirstRebaseEvent at %i days',
    async (days) => {
      const rebaseEvent = await stethEvents.getFirstRebaseEvent({ days });
      expectRebaseEvent(rebaseEvent);
    },
  );
});

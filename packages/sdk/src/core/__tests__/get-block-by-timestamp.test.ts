import { describe, expect, test } from '@jest/globals';
import { useRpcCore } from '../../../tests/utils/fixtures/use-core.js';
import { expectPositiveBn } from '../../../tests/utils/expect/expect-bn.js';

describe('getLatestBlockToTimestamp', () => {
  const core = useRpcCore();

  const toTimestamp = (msTimestamp: number) =>
    BigInt(Math.floor(msTimestamp / 1000));

  test('return latests block', async () => {
    const ts = toTimestamp(Date.now());
    const blocks = [
      await core.getLatestBlockToTimestamp(ts),
      await core.getLatestBlockToTimestamp(ts + 1000n),
      await core.getLatestBlockToTimestamp(ts + 10000n),
    ];

    // eslint-disable-next-line sonarjs/no-ignored-return
    blocks
      .map((b) => b.number)
      .reduce((prev, next) => {
        expectPositiveBn(prev);
        expect(prev).toEqual(next);
        return next;
      });
  });

  test('return latests block correctly', async () => {
    const ts = toTimestamp(Date.now() - 10000000);
    const block = await core.getLatestBlockToTimestamp(ts);
    expect(block.number).toBeLessThanOrEqual(ts);

    const blockAfter = await core.rpcProvider.getBlock({
      blockNumber: block.number + 1n,
    });
    expect(blockAfter.timestamp).toBeGreaterThan(ts);
  });

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('throws error at invalid timestamp', async () => {
    // TODO: research for some reason expectSDKError does not work here
    await expect(core.getLatestBlockToTimestamp(0n)).rejects.toThrow(
      'No blocks at this timestamp',
    );
  });
});

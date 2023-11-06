import { describe, expect, test } from '@jest/globals';
import { useRpcCore } from '../../../tests/utils/use-core.js';
import { expectPositiveBn } from '../../../tests/utils/expect-bn.js';

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

    blocks
      .map((b) => b.number)
      .reduce((prev, next) => {
        expectPositiveBn(prev);
        expect(prev === next);
        return next;
      });
  });

  test('return latests block correctly', async () => {
    const ts = toTimestamp(Date.now() - 10000000);
    const block = await core.getLatestBlockToTimestamp(ts);
    expect(block.number <= ts);
    const blockAfter = await core.rpcProvider.getBlock({
      blockNumber: block.number + 1n,
    });
    expect(blockAfter.number > ts);
  });

  test('throws error at invalid timestamp', async () => {
    await expect(() =>
      core.getLatestBlockToTimestamp(0n),
    ).rejects.toBeDefined();
  });
});

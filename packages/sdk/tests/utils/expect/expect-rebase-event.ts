import { expect } from '@jest/globals';
import { expectPositiveBn } from './expect-bn.js';
import { expectAddress } from './expect-address.js';

export const expectRebaseEvent = (event: any, lidoAddress?: string) => {
  expect(event).toBeDefined();

  expect(event).toHaveProperty('eventName', 'TokenRebased');

  expectPositiveBn(event.args.postTotalEther);
  expectPositiveBn(event.args.postTotalShares);
  expectPositiveBn(event.args.preTotalEther);
  expectPositiveBn(event.args.preTotalShares);
  expectPositiveBn(event.args.reportTimestamp);
  expectPositiveBn(event.args.sharesMintedAsFees);
  expectPositiveBn(event.args.timeElapsed);

  lidoAddress && expectAddress(event.address, lidoAddress);
};

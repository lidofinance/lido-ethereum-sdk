import { type LidoSDKCoreProps, type LidoSDKCore } from '../core/index.js';

export type LidoSDKEventsProps = LidoSDKCoreProps & {
  core?: LidoSDKCore;
};

export type RebaseEvent = {
  address: string;
  blockHash: string;
  blockNumber: bigint;
  data: string;
  logIndex: number;
  removed: boolean;
  topics: string[];
  transactionHash: string;
  transactionIndex: number;
  args: {
    reportTimestamp?: bigint;
    timeElapsed?: bigint;
    preTotalShares?: bigint;
    preTotalEther?: bigint;
    postTotalShares?: bigint;
    postTotalEther?: bigint;
    sharesMintedAsFees?: bigint;
  };
  eventName: 'TokenRebased';
};

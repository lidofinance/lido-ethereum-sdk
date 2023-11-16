import type { Log } from 'viem';
import type { BackArgumentType, BlockArgumentType } from '../core/types.js';
import type { StethEventsAbi } from './abi/stethEvents.js';

export type RebaseEvent = Log<
  bigint,
  number,
  false,
  undefined,
  true,
  typeof StethEventsAbi,
  'TokenRebased'
>;

export type GetRebaseEventsProps = {
  to?: BlockArgumentType;
  maxCount?: number;
  stepBlock?: number;
} & (
  | {
      from: BlockArgumentType;
      back?: undefined;
    }
  | {
      from?: undefined;
      back: BackArgumentType;
    }
);

export type GetLastRebaseEventsProps = {
  count: number;
  stepBlock?: number;
};

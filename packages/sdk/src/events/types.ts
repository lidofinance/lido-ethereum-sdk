import type { GetContractReturnType, Log } from 'viem';
import type {
  BackArgumentType,
  BlockArgumentType,
  LidoSdkPublicClient,
} from '../core/types.js';
import type { StethEventsAbiType } from './abi/stethEvents.js';

export type RebaseEvent = Log<
  bigint,
  number,
  false,
  undefined,
  true,
  StethEventsAbiType,
  'TokenRebased'
>;

export type StethEventsContractType = GetContractReturnType<
  StethEventsAbiType,
  LidoSdkPublicClient
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

import { type Address } from 'viem';

import { type LidoSDKCoreProps, type LidoSDKCore } from '../core/index.js';

export type LidoSDKWithdrawProps = LidoSDKCoreProps & {
  core?: LidoSDKCore;
};

export type RequestStatus = {
  amountOfStETH: bigint;
  amountOfShares: bigint;
  owner: Address;
  timestamp: bigint;
  isFinalized: boolean;
  isClaimed: boolean;
};

export type RequestStatusWithId = {
  amountOfStETH: bigint;
  amountOfShares: bigint;
  owner: Address;
  timestamp: bigint;
  isFinalized: boolean;
  isClaimed: boolean;
  id: bigint;
  stringId: string;
};

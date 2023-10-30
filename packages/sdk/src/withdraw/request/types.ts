import { Hash, type Address } from 'viem';

import { EtherValue, TransactionCallback } from '../../core/index.js';
import { LIDO_TOKENS } from '../../common/constants.js';

export type WithdrawableTokens =
  | (typeof LIDO_TOKENS)['steth']
  | (typeof LIDO_TOKENS)['wsteth'];

export type PermitWstETHStETHProps = {
  amount: bigint;
  account: Address;
  spender: Address;
  deadline: bigint;
};

export type SplitAmountToRequestsProps = {
  amount: EtherValue;
  token: WithdrawableTokens;
};

export type PermitProps = PermitWstETHStETHProps & {
  token: WithdrawableTokens;
};

export type RequestProps = {
  account: Address;
  receiver?: Address;
  token: WithdrawableTokens;
  callback?: TransactionCallback;
} & (
  | {
      amount: EtherValue;
      requests?: undefined;
    }
  | {
      requests: readonly bigint[];
      amount?: undefined;
    }
);

export type SignedPermit = {
  value: bigint;
  deadline: bigint;
  v: number;
  r: Hash;
  s: Hash;
};

export type RequestWithPermitProps = RequestProps & {
  permit?: SignedPermit;
};

export type RequirePermit<TProps> = Omit<TProps, 'permit'> & {
  permit: SignedPermit;
};

export type WithdrawApproveProps = {
  account: Address;
  amount: EtherValue;
  token: WithdrawableTokens;
  callback?: TransactionCallback;
};

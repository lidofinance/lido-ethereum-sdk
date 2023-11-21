import type { Hash, Address } from 'viem';

import type { CommonTransactionProps, EtherValue } from '../../core/index.js';
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

export type RequestProps = CommonTransactionProps & {
  receiver?: Address;
  token: WithdrawableTokens;
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

export type WithdrawApproveProps = CommonTransactionProps & {
  amount: EtherValue;
  token: WithdrawableTokens;
};

export type GetAllowanceProps = {
  account: Address;
  token: WithdrawableTokens;
};

export type CheckAllowanceProps = GetAllowanceProps & {
  amount: EtherValue;
};

export type CheckAllowanceResult = {
  allowance: bigint;
  needsApprove: boolean;
};

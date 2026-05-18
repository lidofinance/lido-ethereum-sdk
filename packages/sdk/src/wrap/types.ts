import type { JsonRpcAccount, Address, GetContractReturnType } from 'viem';
import type {
  EtherValue,
  CommonTransactionProps,
  LidoSdkKeyedClient,
} from '../core/types.js';
import type { EncodableContract } from '../common/index.js';
import type { WstethABIType } from './abi/wsteth.js';
import type { StETHPartialAbiType } from './abi/steth-partial.js';
import type { WstethReferralStakerABIType } from './abi/wsteth-referral-staker.js';

export type WstethContractType = EncodableContract<
  GetContractReturnType<WstethABIType, LidoSdkKeyedClient>
>;

export type StethWrapPartialContractType = GetContractReturnType<
  StETHPartialAbiType,
  LidoSdkKeyedClient
>;

export type WstethReferralStakerContractType = EncodableContract<
  GetContractReturnType<WstethReferralStakerABIType, LidoSdkKeyedClient>
>;

export type WrapProps = CommonTransactionProps & {
  value: EtherValue;
  referralAddress?: Address;
};

export type WrapResults = {
  stethWrapped: bigint;
  wstethReceived: bigint;
};

export type UnwrapResults = {
  wstethUnwrapped: bigint;
  stethReceived: bigint;
};

export type WrapPropsWithoutCallback = Omit<WrapProps, 'callback'>;

export type WrapInnerProps = Omit<CommonTransactionProps, 'account'> & {
  value: bigint;
  account: JsonRpcAccount;
  referralAddress: Address;
};

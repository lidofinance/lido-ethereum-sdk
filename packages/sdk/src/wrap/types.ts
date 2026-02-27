import type { JsonRpcAccount, Address, GetContractReturnType } from 'viem';
import type {
  EtherValue,
  CommonTransactionProps,
  LidoSdkKeyedClients,
} from '../core/types.js';
import type { EncodableContract } from '../common/index.js';
import type { WstethABIType } from './abi/wsteth.js';
import type { StETHPartialAbiType } from './abi/steth-partial.js';
import type { WstethReferralStakerABIType } from './abi/wsteth-referral-staker.js';

export type WstethContractType = EncodableContract<
  GetContractReturnType<WstethABIType, LidoSdkKeyedClients>
>;

export type StethWrapPartialContractType = GetContractReturnType<
  StETHPartialAbiType,
  LidoSdkKeyedClients
>;

export type WstethReferralStakerContractType = EncodableContract<
  GetContractReturnType<WstethReferralStakerABIType, LidoSdkKeyedClients>
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

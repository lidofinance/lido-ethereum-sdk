import type { Address, GetContractReturnType } from 'viem';
import type {
  CommonTransactionProps,
  EtherValue,
  LidoSdkKeyedClients,
  NoTxOptions,
} from '../core/types.js';
import type { JsonRpcAccount } from 'viem';
import type { EncodableContract } from '../common/index.js';
import type { rebasableL2StethAbiType } from './abi/rebasableL2Steth.js';
import type { bridgedWstethAbiType } from './abi/brigedWsteth.js';

export type RebasableL2StethContractType = EncodableContract<
  GetContractReturnType<rebasableL2StethAbiType, LidoSdkKeyedClients>
>;

export type BridgedWstethContractType = EncodableContract<
  GetContractReturnType<bridgedWstethAbiType, LidoSdkKeyedClients>
>;

export type SharesTransferProps = CommonTransactionProps & {
  from?: Address;
  to: Address;
  amount: EtherValue;
};

export type WrapProps = CommonTransactionProps & {
  value: EtherValue;
};

export type WrapResults = {
  stethReceived: bigint;
  wstethWrapped: bigint;
};

export type UnwrapResults = {
  stethUnwrapped: bigint;
  wstethReceived: bigint;
};

export type WrapPropsWithoutTxOptions = NoTxOptions<WrapProps>;

export type WrapInnerProps = Omit<CommonTransactionProps, 'account'> & {
  value: bigint;
  account: JsonRpcAccount;
};

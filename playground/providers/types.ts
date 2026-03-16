import type {
  Config,
  Register,
  UsePublicClientReturnType,
  UseWalletClientReturnType,
} from 'wagmi';
import type { CHAINS } from '@lidofinance/lido-ethereum-sdk/common';
import type * as WagmiChains from 'wagmi/chains';

/** UTILITY TYPES */

// filter object by valid chain ids and return union of its values
type FilterChains<T, ValidIds> = {
  [K in keyof T]: T[K] extends { id: ValidIds } ? T[K] : never;
}[keyof T];

// global registration for all wagmi types
declare module 'wagmi' {
  interface Register {
    config: Config<ChainsList>;
  }
}

/** EXPORT TYPES  */

// numeric literal union of all supported chain ids
export type SupportedChainIds =
  `${CHAINS}`[][number] extends `${infer N extends number}` ? N : never;

// all wagmi chains that are supported by Lido Ethereum SDK
export type SupportedWagmiChain = FilterChains<
  typeof WagmiChains,
  SupportedChainIds
>;

// configuration list of supported chains
export type ChainsList = readonly [
  SupportedWagmiChain,
  ...SupportedWagmiChain[],
];

// quick access to registered wagmi config type
export type RegisteredConfig = Register['config'];

// quick access to registered PublicClient
export type RegisteredPublicClient =
  UsePublicClientReturnType<RegisteredConfig>;

// quick access to registered WalletClient
export type RegisteredWalletClient =
  UseWalletClientReturnType<RegisteredConfig>['data'];

export type MainnetConfig = Config<
  readonly [FilterChains<typeof WagmiChains, CHAINS.Mainnet>]
>;

// quick access to registered PublicClient
export type MainnetPublicClient = UsePublicClientReturnType<MainnetConfig>;

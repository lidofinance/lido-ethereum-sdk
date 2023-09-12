import { type Address } from 'viem';

export enum CHAINS {
  Goerli = 5,
  Mainnet = 1,
}

export const SUPPORTED_CHAINS: CHAINS[] = [CHAINS.Goerli, CHAINS.Mainnet];

export const SUBMIT_EXTRA_GAS_TRANSACTION_RATIO = 1.05;
export const ESTIMATE_ACCOUNT = '0x87c0e047F4e4D3e289A56a36570D4CB957A37Ef1';

export const LIDO_LOCATOR_BY_CHAIN: {
  [key in CHAINS]: Address;
} = {
  [CHAINS.Mainnet]: '0xC1d0b3DE6792Bf6b4b37EccdcC24e45978Cfd2Eb',
  [CHAINS.Goerli]: '0x1eDf09b5023DC86737b59dE68a8130De878984f5',
};

export const LIDO_TOKENS = {
  steth: 'stETH',
  wsteth: 'wstETH',
  eth: 'ETH',
  unsteth: 'unstETH',
} as const;

export const enum LIDO_CONTRACT_NAMES {
  accountingOracle = 'accountingOracle',
  depositSecurityModule = 'depositSecurityModule',
  elRewardsVault = 'elRewardsVault',
  legacyOracle = 'legacyOracle',
  lido = 'lido',
  oracleReportSanityChecker = 'oracleReportSanityChecker',
  postTokenRebaseReceiver = 'postTokenRebaseReceiver',
  burner = 'burner',
  stakingRouter = 'stakingRouter',
  treasury = 'treasury',
  validatorsExitBusOracle = 'validatorsExitBusOracle',
  withdrawalQueue = 'withdrawalQueue',
  withdrawalVault = 'withdrawalVault',
  oracleDaemonConfig = 'oracleDaemonConfig',
  wsteth = 'wsteth',
}

export const CONTRACTS_BY_TOKENS = {
  [LIDO_TOKENS.steth]: LIDO_CONTRACT_NAMES.lido,
  [LIDO_TOKENS.wsteth]: LIDO_CONTRACT_NAMES.wsteth,
  [LIDO_TOKENS.unsteth]: LIDO_CONTRACT_NAMES.withdrawalQueue,
} as const;

export const noop = () => {};

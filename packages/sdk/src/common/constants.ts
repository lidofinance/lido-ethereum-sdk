import { type Address, type Chain } from 'viem';
import { goerli, mainnet, holesky } from 'viem/chains';

export enum CHAINS {
  Goerli = 5,
  Mainnet = 1,
  Holesky = 17000,
}

export const APPROX_BLOCKS_BY_DAY = 7600n;
export const APPROX_SECONDS_PER_BLOCK = 12n;
export const SUPPORTED_CHAINS: CHAINS[] = [
  CHAINS.Goerli,
  CHAINS.Mainnet,
  CHAINS.Holesky,
];

export const SUBMIT_EXTRA_GAS_TRANSACTION_RATIO = 1.05;
export const GAS_TRANSACTION_RATIO_PRECISION = 10 ** 7;
export const ESTIMATE_ACCOUNT = '0x87c0e047F4e4D3e289A56a36570D4CB957A37Ef1';

export const LIDO_LOCATOR_BY_CHAIN: {
  [key in CHAINS]: Address;
} = {
  [CHAINS.Mainnet]: '0xC1d0b3DE6792Bf6b4b37EccdcC24e45978Cfd2Eb',
  [CHAINS.Goerli]: '0x1eDf09b5023DC86737b59dE68a8130De878984f5',
  [CHAINS.Holesky]: '0x28FAB2059C713A7F9D8c86Db49f9bb0e96Af1ef8',
};

export const SUBRGRAPH_ID_BY_CHAIN: {
  [key in CHAINS]: string | null;
} = {
  [CHAINS.Mainnet]: 'HXfMc1jPHfFQoccWd7VMv66km75FoxVHDMvsJj5vG5vf',
  [CHAINS.Goerli]: 'QmeDfGTuNbSoZ71zi3Ch4WNRbzALfiFPnJMYUFPinLiFNa',
  [CHAINS.Holesky]: null,
};

export const EARLIEST_TOKEN_REBASED_EVENT: {
  [key in CHAINS]: bigint;
} = {
  [CHAINS.Mainnet]: 17272708n,
  [CHAINS.Goerli]: 8712039n,
  [CHAINS.Holesky]: 52174n,
} as const;

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

export const NOOP = () => {};

export const EIP2612_TYPE = [
  { name: 'owner', type: 'address' },
  { name: 'spender', type: 'address' },
  { name: 'value', type: 'uint256' },
  { name: 'nonce', type: 'uint256' },
  { name: 'deadline', type: 'uint256' },
] as const;

export const PERMIT_MESSAGE_TYPES = {
  EIP712Domain: [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    {
      name: 'chainId',
      type: 'uint256',
    },
    {
      name: 'verifyingContract',
      type: 'address',
    },
  ],
  Permit: EIP2612_TYPE,
} as const;

export const VIEM_CHAINS: { [key in CHAINS]: Chain } = {
  [CHAINS.Mainnet]: mainnet,
  [CHAINS.Goerli]: goerli,
  [CHAINS.Holesky]: holesky,
};

import { type Address, type Chain } from 'viem';
import {
  mainnet,
  holesky,
  hoodi,
  sepolia,
  optimismSepolia,
  optimism,
  soneiumMinato,
  soneium,
  unichain,
  unichainSepolia,
} from 'viem/chains';

export enum CHAINS {
  Mainnet = 1,
  Holesky = 17000,
  Hoodi = 560048,
  Sepolia = 11155111,
  Optimism = 10,
  OptimismSepolia = 11155420,
  Soneium = 1868,
  SoneiumMinato = 1946,
  Unichain = 130,
  UnichainSepolia = 1301,
}

export const APPROX_BLOCKS_BY_DAY = 7600n;
export const APPROX_SECONDS_PER_BLOCK = 12n;
export const SUPPORTED_CHAINS: CHAINS[] = [
  CHAINS.Mainnet,
  CHAINS.Holesky,
  CHAINS.Hoodi,
  CHAINS.Sepolia,
  CHAINS.Optimism,
  CHAINS.OptimismSepolia,
  CHAINS.Soneium,
  CHAINS.SoneiumMinato,
  CHAINS.Unichain,
  CHAINS.UnichainSepolia,
];

export const SUBMIT_EXTRA_GAS_TRANSACTION_RATIO = 1.05;
export const GAS_TRANSACTION_RATIO_PRECISION = 10 ** 7;

export const LIDO_LOCATOR_BY_CHAIN: {
  [key in CHAINS]?: Address;
} = {
  [CHAINS.Mainnet]: '0xC1d0b3DE6792Bf6b4b37EccdcC24e45978Cfd2Eb',
  [CHAINS.Holesky]: '0x28FAB2059C713A7F9D8c86Db49f9bb0e96Af1ef8',
  [CHAINS.Hoodi]: '0xe2EF9536DAAAEBFf5b1c130957AB3E80056b06D8',
  [CHAINS.Sepolia]: '0x8f6254332f69557A72b0DA2D5F0Bc07d4CA991E7',
};

export const SUBRGRAPH_ID_BY_CHAIN: {
  [key in CHAINS]?: string;
} = {
  [CHAINS.Mainnet]: 'Sxx812XgeKyzQPaBpR5YZWmGV5fZuBaPdh7DFhzSwiQ',
};

export const EARLIEST_TOKEN_REBASED_EVENT: {
  [key in CHAINS]?: bigint;
} = {
  [CHAINS.Mainnet]: 17272708n,
  [CHAINS.Holesky]: 52174n,
  [CHAINS.Sepolia]: 5434668n,
  [CHAINS.Hoodi]: 6372n,
} as const;

export const LIDO_TOKENS = {
  steth: 'stETH',
  wsteth: 'wstETH',
  eth: 'ETH',
  unsteth: 'unstETH',
} as const;

export enum LIDO_CONTRACT_NAMES {
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

export enum DUAL_GOVERNANCE_CONTRACT_NAMES {
  EPT = 'EPT',
}
export const DUAL_GOVERNANCE_CONTRACT_ADDRESSES: {
  [key in CHAINS]?: { [key2 in DUAL_GOVERNANCE_CONTRACT_NAMES]?: Address };
} = {
  [CHAINS.Mainnet]: {
    EPT: '0xCE0425301C85c5Ea2A0873A2dEe44d78E02D2316',
  },
  [CHAINS.Holesky]: {
    EPT: '0xe9c5FfEAd0668AFdBB9aac16163840d649DB76DD',
  },
  [CHAINS.Hoodi]: {
    EPT: '0x0A5E22782C0Bd4AddF10D771f0bF0406B038282d',
  },
};

export enum LIDO_L2_CONTRACT_NAMES {
  wsteth = 'wsteth',
  steth = 'steth',
}

export const LIDO_L2_CONTRACT_ADDRESSES: {
  [key in CHAINS]?: { [key2 in LIDO_L2_CONTRACT_NAMES]?: Address };
} = {
  [CHAINS.OptimismSepolia]: {
    wsteth: '0x24B47cd3A74f1799b32B2de11073764Cb1bb318B',
    steth: '0xf49d208b5c7b10415c7beafe9e656f2df9edfe3b',
  },
  [CHAINS.Optimism]: {
    wsteth: '0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb',
    steth: '0x76A50b8c7349cCDDb7578c6627e79b5d99D24138',
  },
  [CHAINS.Soneium]: {
    wsteth: '0xaA9BD8c957D803466FA92504BDd728cC140f8941',
    steth: '0x0Ce031AEd457C870D74914eCAA7971dd3176cDAF',
  },
  [CHAINS.SoneiumMinato]: {
    wsteth: '0xf7489b8d220DCf33bAe6b594C070061E4da9fDa9',
    steth: '0x4e55E2d4c83df2E0083f1D616AFf007ac420b110',
  },
  [CHAINS.Unichain]: {
    wsteth: '0xc02fE7317D4eb8753a02c35fe019786854A92001',
    steth: '0x81f2508AAC59757EF7425DDc9717AB5c2AA0A84F',
  },
  [CHAINS.UnichainSepolia]: {
    wsteth: '0xE66e1B0931345900024b524A88BBE58f09A18FD0',
    steth: '0x4436b2d6A2a0807b211c6a725E905b736dF8511F',
  },
};

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
  [CHAINS.Holesky]: holesky,
  [CHAINS.Hoodi]: hoodi,
  [CHAINS.Sepolia]: sepolia,
  [CHAINS.Optimism]: optimism,
  [CHAINS.OptimismSepolia]: optimismSepolia,
  [CHAINS.Soneium]: soneium,
  [CHAINS.SoneiumMinato]: soneiumMinato,
  [CHAINS.Unichain]: unichain,
  [CHAINS.UnichainSepolia]: unichainSepolia,
};

export const WQ_API_URLS: { [key in CHAINS]?: string } = {
  [CHAINS.Mainnet]: 'https://wq-api.lido.fi',
  [CHAINS.Holesky]: 'https://wq-api-holesky.testnet.fi',
  [CHAINS.Hoodi]: 'https://wq-api-hoodi.testnet.fi',
};

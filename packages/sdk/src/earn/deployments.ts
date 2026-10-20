import type { EarnDeployment } from './types.js';

export const EARN_MAINNET_DEPLOYMENTS = {
  eth: {
    chainId: 1,
    vault: '0x6a37725ca7f4CE81c004c955f7280d5C704a249e',
    collector: '0x40DA86d29AF2fe980733bD54E364e7507505b41B',
    shareManager: '0xBBFC8683C8fE8cF73777feDE7ab9574935fea0A4',
    baseAsset: 'eth',
    valuationToken: 'wsteth',
    tokens: {
      steth: {
        address: '0xae7ab96520de3a18e5e111b5eaab095312d7fe84',
        decimals: 18,
      },
      eth: {
        address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        decimals: 18,
      },
      weth: {
        address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        decimals: 18,
      },
      wsteth: {
        address: '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
        decimals: 18,
      },
      gg: {
        address: '0xef417FCE1883c6653E7dC6AF7c6F85CCDE84Aa09',
        decimals: 18,
      },
      streth: {
        address: '0xcd3c0F51798D1daA92Fb192E57844Ae6cEE8a6c7',
        decimals: 18,
      },
      dvsteth: {
        address: '0x5E362eb2c0706Bd1d134689eC75176018385430B',
        decimals: 18,
      },
    },
    depositQueues: [
      {
        address: '0xb99394f8b95d426Cb2F013B857C74aCC924b20D5',
        token: 'eth',
        kind: 'sync',
        legacy: false,
      },
      {
        address: '0x1db7094Ef0D994B0b62f6Cd67dB801ad194999A8',
        token: 'eth',
        kind: 'async',
        legacy: true,
      },
      {
        address: '0xCe6C2505fEF74d2dE10FCF1d534cB73eCc837976',
        token: 'weth',
        kind: 'sync',
        legacy: false,
      },
      {
        address: '0x3Fc48660d02e59fBedD0a5Cc18a5580D1f8dD6A4',
        token: 'weth',
        kind: 'async',
        legacy: true,
      },
      {
        address: '0xECD2Bfe725fa14f5Ed86e9bDcc0eA4b34A4ed522',
        token: 'wsteth',
        kind: 'sync',
        legacy: false,
      },
      {
        address: '0xe39EED9A454C4918F8d0682062777cB251cd513F',
        token: 'wsteth',
        kind: 'async',
        legacy: true,
      },
      {
        address: '0x2792004b709E3E88b8FCCb06c3C5e1A6dff0EC2B',
        token: 'gg',
        kind: 'sync',
        legacy: false,
      },
      {
        address: '0x411172F1E5310d03b38128F2a294F2e33c691B30',
        token: 'gg',
        kind: 'async',
        legacy: true,
      },
      {
        address: '0xA4F23f56442C01a478af20fe06b9F5f8f05aDD96',
        token: 'streth',
        kind: 'sync',
        legacy: false,
      },
      {
        address: '0x268ea1cc674cdaE200c4609E7b09d03Dc618E663',
        token: 'streth',
        kind: 'async',
        legacy: true,
      },
      {
        address: '0xA80f247b92C79740b0610b754403D5cb0bf216b5',
        token: 'dvsteth',
        kind: 'sync',
        legacy: false,
      },
      {
        address: '0x4bDd2Ea1E20acb13f2758190c92a84175107A86f',
        token: 'dvsteth',
        kind: 'async',
        legacy: true,
      },
    ],
    redeemQueues: [
      {
        address: '0xB5984D87d21C4375d18972fd546b688BD4Fc1f0A',
        token: 'wsteth',
        kind: 'sync',
      },
      {
        address: '0x095bFAca9f1c6F2B063Cd67C6d6bfcd0c3aaB7b4',
        token: 'wsteth',
        kind: 'async',
      },
    ],
  },
  usd: {
    chainId: 1,
    vault: '0x014e6DA8F283C4aF65B2AA0f201438680A004452',
    collector: '0x40DA86d29AF2fe980733bD54E364e7507505b41B',
    shareManager: '0x4Ce1ac8F43E0E5BD7A346A98aF777bF8fbeA1981',
    baseAsset: 'usdc',
    valuationToken: 'usdc',
    tokens: {
      usdc: {
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        decimals: 6,
      },
      usdt: {
        address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        decimals: 6,
      },
      usde: {
        address: '0x4c9edd5852cd905f086c759e8383e09bff1e68b3',
        decimals: 18,
      },
    },
    depositQueues: [
      {
        address: '0xf6AFAf6afcAe116dD37A779D50fE6c5fa6f8C8f5',
        token: 'usdc',
        kind: 'sync',
        legacy: false,
      },
      {
        address: '0xC75E7E73B25fEa8bB23EB55CC48BA55067b5be76',
        token: 'usdc',
        kind: 'async',
        legacy: true,
      },
      {
        address: '0x534d0bEb82C47cf703BFb9E959297658b65Ec8E9',
        token: 'usdt',
        kind: 'sync',
        legacy: false,
      },
      {
        address: '0xEeC5041c47Cba1e31321AC6941Bf09Ad60645B73',
        token: 'usdt',
        kind: 'async',
        legacy: true,
      },
      {
        address: '0xeec37568b01e0c4d5028501a49e024b475e2d7ca',
        token: 'usde',
        kind: 'async',
        legacy: false,
      },
    ],
    redeemQueues: [
      {
        address: '0xE0eee7e956A94BD00546d9CA07e5012F11A5059d',
        token: 'usdc',
        kind: 'sync',
      },
      {
        address: '0x9e36A74FE278906a76e7615263e46a83fC40c47F',
        token: 'usdc',
        kind: 'async',
      },
      {
        address: '0x95092A7a86715246Be6395b8D514B3d60A270Cd3',
        token: 'usdt',
        kind: 'async',
      },
    ],
  },
} as const satisfies Record<'eth' | 'usd', EarnDeployment>;

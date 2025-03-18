import { defineChain } from 'viem';

export const hoodi = defineChain({
  id: 560048,
  name: 'Hoodi',
  nativeCurrency: { name: 'Hoodi Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.hoodi.ethpandaops.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Explorer',
      url: 'https://explorer.hoodi.ethpandaops.io/',
    },
  },
  contracts: {},
  testnet: true,
});

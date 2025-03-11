import { defineChain } from 'viem';
import { chainConfig } from 'viem/op-stack';

// TODO: replace with import from 'viem/chains'
// Copy-pasted from
// https://github.com/wevm/viem/blob/c52c8ed2a2e18d1e0d433fe87990bc5539d579be/src/chains/definitions/unichain.ts
// Reason: we had to downgrade viem to 2.22.23 because of the critical issue with Safe
// But viem v2.22.23 doesn't have Unichain support, so Unichain is defined here.
// viem v2.23.1 added Unichain support

const sourceId = 1; // mainnet

export const unichain = defineChain({
  ...chainConfig,
  id: 130,
  name: 'Unichain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://mainnet.unichain.org/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Uniscan',
      url: 'https://uniscan.xyz',
      apiUrl: 'https://api.uniscan.xyz/api',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 0,
    },
    disputeGameFactory: {
      [sourceId]: {
        address: '0x2F12d621a16e2d3285929C9996f478508951dFe4',
      },
    },
    portal: {
      [sourceId]: {
        address: '0x0bd48f6B86a26D3a217d0Fa6FfE2B491B956A7a2',
      },
    },
    l1StandardBridge: {
      [sourceId]: {
        address: '0x81014F44b0a345033bB2b3B21C7a1A308B35fEeA',
      },
    },
  },
  sourceId,
});

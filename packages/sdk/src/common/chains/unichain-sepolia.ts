import { defineChain } from 'viem';
import { chainConfig } from 'viem/op-stack';

// TODO: replace with import from 'viem/chains'
// Copy-pasted from
// https://github.com/wevm/viem/blob/c52c8ed2a2e18d1e0d433fe87990bc5539d579be/src/chains/definitions/unichainSepolia.ts
// Reason: we had to downgrade viem to 2.22.23 because of the critical issue with Safe
// But viem v2.22.23 doesn't have Unichain support, so Unichain is defined here.
// viem v2.23.1 added Unichain support

const sourceId = 11_155_111; // sepolia

export const unichainSepolia = defineChain({
  ...chainConfig,
  id: 1301,
  name: 'Unichain Sepolia',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://sepolia.unichain.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Uniscan',
      url: 'https://sepolia.uniscan.xyz',
      apiUrl: 'https://api-sepolia.uniscan.xyz/api',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 0,
    },
    portal: {
      [sourceId]: {
        address: '0x0d83dab629f0e0F9d36c0Cbc89B69a489f0751bD',
      },
    },
    l1StandardBridge: {
      [sourceId]: {
        address: '0xea58fcA6849d79EAd1f26608855c2D6407d54Ce2',
      },
    },
    disputeGameFactory: {
      [sourceId]: {
        address: '0xeff73e5aa3B9AEC32c659Aa3E00444d20a84394b',
      },
    },
  },
  testnet: true,
  sourceId,
});

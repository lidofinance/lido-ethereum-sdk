/* eslint-disable @typescript-eslint/ban-ts-comment */
import { FC, PropsWithChildren } from 'react';
import { ProviderWeb3 } from '@reef-knot/web3-react';
import { getConnectors, holesky } from '@reef-knot/core-react';
import { backendRPC, getBackendRPCPath, dynamics } from 'config';
import { WagmiConfig, createClient, configureChains, Chain } from 'wagmi';
import * as wagmiChains from 'wagmi/chains';
import { getStaticRpcBatchProvider } from '@lido-sdk/providers';

const wagmiChainsArray = Object.values({ ...wagmiChains, holesky });
const supportedChains = wagmiChainsArray.filter((chain) =>
  dynamics.supportedChains.includes(chain.id),
);
const defaultChain = wagmiChainsArray.find(
  (chain) => chain.id === dynamics.defaultChain,
);

const jsonRcpBatchProvider = (chain: Chain) => ({
  provider: () =>
    getStaticRpcBatchProvider(
      chain.id,
      getBackendRPCPath(chain.id),
      undefined,
      12000,
    ),
  chain,
});

const { chains, provider, webSocketProvider } = configureChains(
  supportedChains,
  [jsonRcpBatchProvider],
);

const connectors = getConnectors({
  chains,
  defaultChain,
  rpc: backendRPC,
  walletconnectProjectId: dynamics.walletconnectProjectId,
});

const client = createClient({
  connectors,
  autoConnect: true,
  provider,
  webSocketProvider,
});

const Web3Provider: FC<PropsWithChildren> = ({ children }) => (
  <WagmiConfig client={client}>
    {/* @ts-ignore */}
    <ProviderWeb3
      pollingInterval={1200}
      defaultChainId={dynamics.defaultChain}
      supportedChainIds={dynamics.supportedChains}
      rpc={backendRPC}
      walletconnectProjectId={dynamics.walletconnectProjectId}
    >
      {children}
    </ProviderWeb3>
  </WagmiConfig>
);

export default Web3Provider;

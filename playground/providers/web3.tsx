/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react';
import { dynamics } from 'config';
import { ProviderWeb3 } from '@reef-knot/web3-react';
import { getConnectors, holesky } from '@reef-knot/core-react';
import { WagmiConfig, createClient, configureChains, Chain } from 'wagmi';
import * as wagmiChains from 'wagmi/chains';
import { getStaticRpcBatchProvider } from '@lido-sdk/providers';
import invariant from 'tiny-invariant';
import { CHAINS } from '@lido-sdk/constants';

const wagmiChainsArray = Object.values({ ...wagmiChains, holesky });
const supportedChains = wagmiChainsArray.filter((chain) =>
  dynamics.supportedChains.includes(chain.id),
);

// Adding Mumbai as a temporary workaround
// for the wagmi and walletconnect bug, when some wallets are failing to connect
// when there are only one supported network, so we need at least 2 of them.
// Mumbai should be the last in the array, otherwise wagmi can send request to it.
// TODO: remove after updating wagmi to v1+
supportedChains.push(wagmiChains.polygonMumbai);

const defaultChain = wagmiChainsArray.find(
  (chain) => chain.id === dynamics.defaultChain,
);

type CustomRpcContextValue = {
  customRpc: Record<number, string | null>;
  activeRpc: Record<number, string>;
  setCustomRpcUrl: (chain: number, rpcUrl: string | null) => void;
};

const CustomRpcContext = createContext<CustomRpcContextValue | null>(null);
CustomRpcContext.displayName = 'CustomRpcContext';

export const useCustomRpc = () => {
  const context = useContext(CustomRpcContext);
  invariant(context);
  return context;
};

const Web3Provider: FC<PropsWithChildren> = ({ children }) => {
  const [customRpc, setCustomRpc] = useState<Record<number, string | null>>({});

  const activeRpc: Record<number, string> = useMemo(() => {
    const getRpc = (chain: number): string =>
      customRpc[chain] ?? dynamics.rpcProviderUrls[chain];
    return {
      [CHAINS.Mainnet]: getRpc(CHAINS.Mainnet),
      [CHAINS.Goerli]: getRpc(CHAINS.Goerli),
      [CHAINS.Holesky]: getRpc(CHAINS.Holesky),
      // TODO: update @lido-sdk/constants
      11155111: getRpc(11155111),
    };
  }, [customRpc]);

  const customRpcContextValue = useMemo(
    () => ({
      customRpc,
      activeRpc,
      setCustomRpcUrl: (chain: number, rpcUrl: string | null) => {
        setCustomRpc((old) => ({ ...old, [chain]: rpcUrl }));
      },
    }),
    [customRpc, activeRpc],
  );

  const client = useMemo(() => {
    const jsonRcpBatchProvider = (chain: Chain) => ({
      provider: () =>
        getStaticRpcBatchProvider(
          chain.id,
          activeRpc[chain.id],
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
      rpc: activeRpc,
      walletconnectProjectId: dynamics.walletconnectProjectId,
    });

    return createClient({
      connectors,
      autoConnect: true,
      provider,
      webSocketProvider,
    });
  }, [activeRpc]);

  return (
    <CustomRpcContext.Provider value={customRpcContextValue}>
      <WagmiConfig client={client}>
        {/* @ts-ignore */}
        <ProviderWeb3
          pollingInterval={1200}
          defaultChainId={dynamics.defaultChain}
          supportedChainIds={dynamics.supportedChains}
          rpc={activeRpc}
          walletconnectProjectId={dynamics.walletconnectProjectId}
        >
          {children}
        </ProviderWeb3>
      </WagmiConfig>
    </CustomRpcContext.Provider>
  );
};

export default Web3Provider;

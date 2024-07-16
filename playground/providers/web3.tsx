/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react';
import { WalletsModalForEth } from 'reef-knot/connect-wallet-modal';
import { dynamics } from 'config';
import { WalletsListEthereum } from 'reef-knot/wallets';
import {
  AutoConnect,
  getWalletsDataList,
  ReefKnot,
} from 'reef-knot/core-react';
import { createConfig, http, WagmiProvider } from 'wagmi';
import * as wagmiChains from 'wagmi/chains';
import invariant from 'tiny-invariant';
import { CHAINS } from '@lido-sdk/constants';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useThemeToggle } from '@lidofinance/lido-ui';

type ChainsList = [wagmiChains.Chain, ...wagmiChains.Chain[]];

const wagmiChainsArray = Object.values(wagmiChains) as any as ChainsList;

const supportedChains = wagmiChainsArray.filter((chain) =>
  dynamics.supportedChains.includes(chain.id),
) as ChainsList;

const defaultChain = wagmiChainsArray.find(
  (chain) => chain.id === dynamics.defaultChain,
);

const queryClient = new QueryClient();

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
  const { themeName } = useThemeToggle();
  const [customRpc, setCustomRpc] = useState<Record<number, string | null>>({});

  const activeRpc: Record<number, string> = useMemo(() => {
    const getRpc = (chain: number): string =>
      customRpc[chain] ?? dynamics.rpcProviderUrls[chain];
    return {
      [CHAINS.Mainnet]: getRpc(CHAINS.Mainnet),
      [CHAINS.Goerli]: getRpc(CHAINS.Goerli),
      [CHAINS.Holesky]: getRpc(CHAINS.Holesky),
      [CHAINS.Sepolia]: getRpc(CHAINS.Sepolia),
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

  // const client = useMemo(() => {
  //   const jsonRcpBatchProvider = (chain: Chain) => ({
  //     provider: () =>
  //       getStaticRpcBatchProvider(
  //         chain.id,
  //         activeRpc[chain.id],
  //         undefined,
  //         12000,
  //       ),
  //     chain,
  //   });

  //   const { chains, provider, webSocketProvider } = configureChains(
  //     supportedChains,
  //     [jsonRcpBatchProvider],
  //   );

  //   const connectors = getConnectors({
  //     chains,
  //     defaultChain,
  //     rpc: activeRpc,
  //     walletconnectProjectId: dynamics.walletconnectProjectId,
  //   });

  //   return createClient({
  //     connectors,
  //     autoConnect: true,
  //     provider,
  //     webSocketProvider,
  //   });
  // }, [activeRpc]);

  const { walletsDataList } = useMemo(() => {
    return getWalletsDataList({
      walletsList: WalletsListEthereum,
      rpc: activeRpc,
      walletconnectProjectId: dynamics.walletconnectProjectId,
      defaultChain: defaultChain,
    });
  }, [activeRpc, defaultChain, dynamics.walletconnectProjectId]);

  const config = useMemo(() => {
    return createConfig({
      chains: supportedChains,
      ssr: true,
      multiInjectedProviderDiscovery: false,
      transports: supportedChains.reduce(
        (res, curr) => ({
          ...res,
          [curr.id]: http(activeRpc[curr.id], { batch: true }),
        }),
        {},
      ),
    });
  }, [supportedChains, activeRpc]);

  return (
    <CustomRpcContext.Provider value={customRpcContextValue}>
      <WagmiProvider config={config} reconnectOnMount={false}>
        <QueryClientProvider client={queryClient}>
          <ReefKnot
            rpc={activeRpc}
            chains={supportedChains}
            walletDataList={walletsDataList}
          >
            <AutoConnect autoConnect />

            {children}
            <WalletsModalForEth shouldInvertWalletIcon={themeName === 'dark'} />
          </ReefKnot>
        </QueryClientProvider>
      </WagmiProvider>
    </CustomRpcContext.Provider>
  );
};

export default Web3Provider;

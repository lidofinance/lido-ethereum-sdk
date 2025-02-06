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
import { CHAINS } from '@lidofinance/lido-ethereum-sdk';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useThemeToggle } from '@lidofinance/lido-ui';

type ChainsList = [wagmiChains.Chain, ...wagmiChains.Chain[]];

export const L2_CHAINS = [10, 11155420, 1946];

const wagmiChainsArray = Object.values(wagmiChains) as any as ChainsList;

const supportedChains = wagmiChainsArray.filter((chain) =>
  dynamics.supportedChains.includes(chain.id),
) as ChainsList;

const defaultChain =
  wagmiChainsArray.find((chain) => chain.id === dynamics.defaultChain) ||
  supportedChains[0]; // first supported chain as fallback;

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
      [CHAINS.Holesky]: getRpc(CHAINS.Holesky),
      [CHAINS.Sepolia]: getRpc(CHAINS.Sepolia),
      // OP sepolia
      [CHAINS.OptimismSepolia]: getRpc(CHAINS.OptimismSepolia),
      // Soneium Minato
      [CHAINS.SoneiumMinato]: getRpc(CHAINS.SoneiumMinato),
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

  const { walletsDataList } = useMemo(() => {
    return getWalletsDataList({
      walletsList: WalletsListEthereum,
      rpc: activeRpc,
      walletconnectProjectId: dynamics.walletconnectProjectId,
      defaultChain: defaultChain,
    });
  }, [activeRpc]);

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
  }, [activeRpc]);

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

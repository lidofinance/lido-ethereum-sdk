import { Button } from '@lidofinance/lido-ui';
import { useSupportedChains } from 'reef-knot/web3-react';
import { useAccount, useConfig, useSwitchChain } from 'wagmi';
import * as wagmiChains from 'wagmi/chains';
import {
  BannerActionsStyle,
  BannerStyle,
  BannerTextStyle,
  BannerTitleStyle,
} from './styles';

const KNOWN_CHAINS = Object.values(wagmiChains);

const chainLabel = (chainId: number) => {
  const name = KNOWN_CHAINS.find((chain) => chain.id === chainId)?.name;
  return name ? `${name} (${chainId})` : `chain ${chainId}`;
};

/** Wallet is connected, but its active chain is not in SUPPORTED_CHAINS. */
export const useIsUnsupportedChain = () => {
  const { isConnected } = useAccount();
  const { isUnsupported } = useSupportedChains();
  return isConnected && isUnsupported;
};

export const UnsupportedChainBanner = () => {
  const { chainId } = useAccount();
  const { chains } = useConfig();
  const { switchChain, isPending, variables, error } = useSwitchChain();
  const isUnsupported = useIsUnsupportedChain();

  if (!isUnsupported) return null;

  return (
    <BannerStyle role="alert">
      <BannerTitleStyle>Unsupported network</BannerTitleStyle>
      <BannerTextStyle>
        Your wallet is connected to{' '}
        <strong>{chainId ? chainLabel(chainId) : 'an unknown network'}</strong>,
        which is not enabled in this playground. Wallet actions are disabled
        until you switch to one of the supported networks:
      </BannerTextStyle>
      <BannerActionsStyle>
        {chains.map((chain) => (
          <Button
            key={chain.id}
            size="xs"
            variant="outlined"
            color="warning"
            loading={isPending && variables?.chainId === chain.id}
            disabled={isPending}
            onClick={() => switchChain({ chainId: chain.id })}
          >
            Switch to {chain.name}
          </Button>
        ))}
      </BannerActionsStyle>
      {error && (
        <BannerTextStyle>
          Could not switch automatically: {error.message.split('\n')[0]}. Switch
          the network in your wallet.
        </BannerTextStyle>
      )}
    </BannerStyle>
  );
};

import { CHAINS } from '@lido-sdk/constants';
import { Block } from '@lidofinance/lido-ui';
import { useSupportedChains, useWeb3 } from 'reef-knot/web3-react';
import { useMemo } from 'react';
import styled from 'styled-components';
import { useAccount } from 'wagmi';

const ErrorBlock = styled(Block)`
  text-align: center;
  background: var(--lido-color-error);
  background-image: none !important;
  margin: 16px 0;
`;

export const ConnectionError = () => {
  const { error } = useWeb3();
  const { isConnected } = useAccount();
  const { isUnsupported, supportedChains } = useSupportedChains();

  const chains = useMemo(() => {
    const chains = supportedChains
      .map(({ chainId, name }) => CHAINS[chainId] || name)
      .filter((chain) => chain !== 'unknown');
    const lastChain = chains.pop();

    return [chains.join(', '), lastChain].filter((chain) => chain).join(' or ');
  }, [supportedChains]);

  if (isConnected && isUnsupported) {
    return `Unsupported chain. Please switch to ${chains} in your wallet and restart the page.`;
  }

  if (!error) {
    return;
  }

  return <ErrorBlock color="accent">{error.message}</ErrorBlock>;
};

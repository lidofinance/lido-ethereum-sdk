import { CHAINS } from '@lido-sdk/constants';
import { Block } from '@lidofinance/lido-ui';
import { useConnectorError, useSupportedChains } from '@reef-knot/web3-react';
import { useMemo } from 'react';
import styled from 'styled-components';

const ErrorBlock = styled(Block)`
  text-align: center;
  background: var(--lido-color-error);
  background-image: none !important;
  margin: 16px 0;
`;

export const ConnectionError = () => {
  let errorMessage = useConnectorError()?.message;
  const { isUnsupported, supportedChains } = useSupportedChains();

  const chains = useMemo(() => {
    const chains = supportedChains
      .map(({ chainId, name }) => CHAINS[chainId] || name)
      .filter((chain) => chain !== 'unknown');
    const lastChain = chains.pop();

    return [chains.join(', '), lastChain].filter((chain) => chain).join(' or ');
  }, [supportedChains]);

  if (isUnsupported) {
    errorMessage = `Unsupported chain. Please switch to ${chains} in your wallet and restart the page.`;
  }

  if (!errorMessage) return null;
  return <ErrorBlock color="accent">{errorMessage}</ErrorBlock>;
};

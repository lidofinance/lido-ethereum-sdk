import { Block } from '@lidofinance/lido-ui';
import { useWeb3 } from 'reef-knot/web3-react';
import styled from 'styled-components';

const ErrorBlock = styled(Block)`
  text-align: center;
  background: var(--lido-color-error);
  background-image: none !important;
  margin: 16px 0;
`;

export const ConnectionError = () => {
  const { error } = useWeb3();
  // Unsupported chain is reported by UnsupportedChainBanner.
  if (!error) {
    return;
  }

  return <ErrorBlock color="accent">{error.message}</ErrorBlock>;
};

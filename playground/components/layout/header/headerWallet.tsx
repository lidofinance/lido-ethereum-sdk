import { FC } from 'react';
import { getChainColor } from '@lido-sdk/constants';

import { useWeb3 } from 'reef-knot/web3-react';
import { ThemeToggler } from '@lidofinance/lido-ui';

import WalletButton from 'components/layout/header/walletButton';
import WalletConnect from 'components/layout/header/walletConnect';

import { HeaderWalletChainStyle } from './headerWalletStyles';

import { useChains } from 'wagmi';

const tryGetColor = (chainId: number) => {
  try {
    return getChainColor(chainId);
  } catch {
    return '#FFFFFF';
  }
};

const HeaderWallet: FC = () => {
  const { active, chainId } = useWeb3();
  const chains = useChains();

  const currentChain = chains.find((chain) => chain.id === chainId);

  return (
    <>
      {chainId && (
        <HeaderWalletChainStyle $color={tryGetColor(chainId)}>
          {currentChain?.name}
        </HeaderWalletChainStyle>
      )}
      {active ? <WalletButton /> : <WalletConnect size="sm" />}
      <ThemeToggler />
    </>
  );
};

export default HeaderWallet;

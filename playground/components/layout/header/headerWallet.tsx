import { FC } from 'react';
import { CHAINS, getChainColor } from '@lido-sdk/constants';

import { useWeb3 } from '@reef-knot/web3-react';
import { ThemeToggler } from '@lidofinance/lido-ui';

import WalletButton from 'components/layout/header/walletButton';
import WalletConnect from 'components/layout/header/walletConnect';

import { HeaderWalletChainStyle } from './headerWalletStyles';

const HeaderWallet: FC = () => {
  const { active, chainId } = useWeb3();
  // TODO: update @lido-sdk/constants
  const chainName = chainId && { ...CHAINS, 11155111: 'Sepolia' }[chainId];
  const isSepolia = chainId === 11155111;

  return (
    <>
      {chainId && (
        <HeaderWalletChainStyle
          // TODO: update @lido-sdk/constants -> getChainColor
          $color={isSepolia ? '#FFD700' : getChainColor(chainId)}
        >
          {chainName}
        </HeaderWalletChainStyle>
      )}
      {active ? <WalletButton /> : <WalletConnect size="sm" />}
      <ThemeToggler />
    </>
  );
};

export default HeaderWallet;

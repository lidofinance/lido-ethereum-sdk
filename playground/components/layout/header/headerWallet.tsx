import { FC } from 'react';
import { CHAINS, getChainColor } from '@lido-sdk/constants';
import { useSDK } from '@lido-sdk/react';
import { useWeb3 } from '@reef-knot/web3-react';
import { ThemeToggler } from '@lidofinance/lido-ui';

import WalletButton from 'components/layout/header/walletButton';
import WalletConnect from 'components/layout/header/walletConnect';

import { HeaderWalletChainStyle } from './headerWalletStyles';

const HeaderWallet: FC = () => {
  const { active } = useWeb3();
  // const { chainId } = useSDK();

  // const chainName = CHAINS[chainId];
  // const testNet = chainId !== CHAINS.Mainnet;
  // const showNet = testNet && active;

  return (
    <>
      {/* {showNet && (
        <HeaderWalletChainStyle $color={getChainColor(chainId)}>
          {chainName}
        </HeaderWalletChainStyle>
      )} */}
      {active ? <WalletButton /> : <WalletConnect size="sm" />}
      <ThemeToggler />
    </>
  );
};

export default HeaderWallet;

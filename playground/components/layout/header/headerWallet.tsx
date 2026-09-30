import { FC } from 'react';
import { getChainColor } from '@lido-sdk/constants';

import { useWeb3 } from 'reef-knot/web3-react';
import { ThemeToggler } from '@lidofinance/lido-ui';

import WalletButton from 'components/layout/header/walletButton';
import WalletConnect from 'components/layout/header/walletConnect';

import { HeaderChipStyle, HeaderWalletChainStyle } from './headerWalletStyles';
import { useIsCustomRpc } from 'components/custom-rpc-input';
import { useModal } from 'hooks/useModal';
import { MODAL } from 'providers';

import { useChains } from 'wagmi';

const tryGetColor = (chainId: number) => {
  try {
    return getChainColor(chainId);
  } catch {
    return 'var(--lido-color-textSecondary)';
  }
};

const HeaderWallet: FC = () => {
  const { active, chainId } = useWeb3();
  const chains = useChains();

  const currentChain = chains.find((chain) => chain.id === chainId);
  const isCustomRpc = useIsCustomRpc();
  const { openModal: openRpcModal } = useModal(MODAL.rpc);

  return (
    <>
      {chainId && (
        <HeaderWalletChainStyle $color={tryGetColor(chainId)}>
          {currentChain?.name}
        </HeaderWalletChainStyle>
      )}
      <HeaderChipStyle
        type="button"
        $highlighted={isCustomRpc}
        title="Configure RPC for the current chain"
        onClick={openRpcModal}
      >
        RPC: {isCustomRpc ? 'custom' : 'default'}
      </HeaderChipStyle>
      {active ? <WalletButton /> : <WalletConnect size="sm" />}
      <ThemeToggler />
    </>
  );
};

export default HeaderWallet;

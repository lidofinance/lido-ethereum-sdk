import { FC } from 'react';
import { ButtonProps } from '@lidofinance/lido-ui';
import AddressBadge from 'components/layout/header/walletButton/addressBadge';
import {
  WalledButtonStyle,
  WalledButtonWrapperStyle,
} from './walletButtonStyles';
import { useModal } from 'hooks/useModal';
import { MODAL } from 'providers';
import { useWeb3 } from '@reef-knot/web3-react';

const WalletButton: FC<ButtonProps> = (props) => {
  const { onClick, ...rest } = props;
  const { openModal } = useModal(MODAL.wallet);
  const { account } = useWeb3();

  return (
    <WalledButtonStyle
      size="sm"
      variant="text"
      color="secondary"
      onClick={openModal}
      {...rest}
    >
      <WalledButtonWrapperStyle>
        <AddressBadge address={account} />
      </WalledButtonWrapperStyle>
    </WalledButtonStyle>
  );
};

export default WalletButton;

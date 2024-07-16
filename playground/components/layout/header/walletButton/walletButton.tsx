import { FC } from 'react';
import { ButtonProps } from '@lidofinance/lido-ui';
import AddressBadge from 'components/layout/header/walletButton/addressBadge';
import {
  WalledButtonStyle,
  WalledButtonWrapperStyle,
} from './walletButtonStyles';
import { useAccount } from 'wagmi';
import { useModal } from 'hooks/useModal';
import { MODAL } from 'providers';

const WalletButton: FC<ButtonProps> = (props) => {
  const { onClick, ...rest } = props;
  const { address } = useAccount();
  const { openModal } = useModal(MODAL.wallet);

  return (
    <WalledButtonStyle
      size="sm"
      variant="text"
      color="secondary"
      onClick={openModal}
      {...rest}
    >
      <WalledButtonWrapperStyle>
        <AddressBadge address={address} />
      </WalledButtonWrapperStyle>
    </WalledButtonStyle>
  );
};

export default WalletButton;

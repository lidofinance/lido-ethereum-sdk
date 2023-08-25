import { FC } from 'react';
import { ButtonProps } from '@lidofinance/lido-ui';
import AddressBadge from 'components/layout/header/walletButton/addressBadge';
import {
  WalledButtonStyle,
  WalledButtonWrapperStyle,
  WalledButtonBalanceStyle,
  WalledButtonLoaderStyle,
} from './walletButtonStyles';
import { useModal } from 'hooks/useModal';
import FormatToken from 'components/formatToken';
import { MODAL } from 'providers';
import { useWeb3 } from '@reef-knot/web3-react';

const WalletButton: FC<ButtonProps> = (props) => {
  const { onClick, ...rest } = props;
  const { openModal } = useModal(MODAL.wallet);
  const { account } = useWeb3();
  // const { data: balance, initialLoading } = useEthereumBalance();

  return (
    <WalledButtonStyle
      size="sm"
      variant="text"
      color="secondary"
      onClick={openModal}
      {...rest}
    >
      <WalledButtonWrapperStyle>
        <WalledButtonBalanceStyle>
          {/* {initialLoading ? (
            <WalledButtonLoaderStyle />
          ) : (
            <FormatToken amount={balance} symbol="ETH" />
          )} */}
        </WalledButtonBalanceStyle>
        <AddressBadge address={account} />
      </WalledButtonWrapperStyle>
    </WalledButtonStyle>
  );
};

export default WalletButton;

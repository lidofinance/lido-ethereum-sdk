import { FC } from 'react';
import { Button, ButtonProps } from '@lidofinance/lido-ui';
import { useModal } from 'hooks/useModal';
import { MODAL } from 'providers';

const WalletConnect: FC<ButtonProps> = (props) => {
  const { onClick, ...rest } = props;
  const { openModal } = useModal(MODAL.connect);

  return (
    <Button onClick={openModal} {...rest}>
      Connect wallet
    </Button>
  );
};

export default WalletConnect;

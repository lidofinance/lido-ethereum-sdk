import { FC } from 'react';
import { Button, ButtonProps } from '@lidofinance/lido-ui';
import { useConnect } from 'reef-knot/core-react';

const WalletConnect: FC<ButtonProps> = (props) => {
  const { onClick, ...rest } = props;
  const { connect } = useConnect();

  return (
    <Button onClick={connect} {...rest}>
      Connect wallet
    </Button>
  );
};

export default WalletConnect;

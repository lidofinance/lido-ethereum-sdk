import { TokenDemo } from 'demo/tokens';
import { useLidoSDK } from 'providers/sdk';

export const WstethL2Demo = () => {
  const { l2 } = useLidoSDK();
  return <TokenDemo name="L2 wstETH" instance={l2.wsteth} />;
};

export const StethL2Demo = () => {
  const { l2 } = useLidoSDK();
  return (
    <>
      <TokenDemo name="L2 stETH" instance={l2.steth} />
    </>
  );
};

import { Accordion } from '@lidofinance/lido-ui';
import { useWeb3 } from '@reef-knot/web3-react';
import { Action } from 'components/action';
import { useLidoSDK } from 'providers/sdk';

export const StatisticsDemo = () => {
  const { statistics } = useLidoSDK();

  return (
    <Accordion summary="Statistic">
      <Action title="Last Apr" action={() => statistics.apr.getLastApr()} />
      <Action title="SMA Apr" action={() => statistics.apr.getSmaApr({ days: 7 })} />
    </Accordion>
  );
};

import { Accordion } from '@lidofinance/lido-ui';
import { useWeb3 } from '@reef-knot/web3-react';
import { Action } from 'components/action';
import { useLidoSDK } from 'providers/sdk';

export const EventsDemo = () => {
  const { events } = useLidoSDK();

  return (
    <Accordion summary="Events">
      <Action
        title="Last Rebase event"
        action={() => events.stethEvents.getLastRebaseEvent()}
      />
      <Action
        title="Last 10 Rebase events"
        action={() => events.stethEvents.getRebaseEvents({ count: 10 })}
      />
    </Accordion>
  );
};

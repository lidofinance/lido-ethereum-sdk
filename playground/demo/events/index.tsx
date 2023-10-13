import { Accordion, Input } from '@lidofinance/lido-ui';
import { useWeb3 } from '@reef-knot/web3-react';
import { Action } from 'components/action';
import { useLidoSDK } from 'providers/sdk';
import { useState } from 'react';

export const EventsDemo = () => {
  const [daysAgoValue, setDaysAgoValue] = useState<number>(1);
  const { events } = useLidoSDK();

  return (
    <Accordion summary="Events">
      <Action
        title="Last Rebase event"
        action={() => events.stethEvents.getLastRebaseEvent()}
      />
      <Action
        title="First Rebase event"
        action={() =>
          events.stethEvents.getFirstRebaseEvent({
            daysAgo: daysAgoValue
          })
        }
      >
        <Input
          label="Days ago"
          placeholder='7'
          type="number"
          min={1}
          value={daysAgoValue}
          onChange={(e) => setDaysAgoValue(e.target.valueAsNumber)}
        />
      </Action>
      <Action
        title="Last 10 Rebase events"
        action={() => events.stethEvents.getRebaseEvents({ count: 10 })}
      />
      <Action
        title="Last Rebase events by 7 days"
        action={() => events.stethEvents.getRebaseEventsByDays({ days: 7 })}
      />
    </Accordion>
  );
};

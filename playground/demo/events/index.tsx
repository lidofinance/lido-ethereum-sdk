import { Accordion, Input, Select, Option } from '@lidofinance/lido-ui';
import { Action } from 'components/action';
import {
  useBackArgumentState,
  BackArgumentInput,
} from 'components/back-argument-input';
import {
  BlockArgumentInput,
  DEFAULT_FROM,
  useBlockArgumentState,
} from 'components/block-argument-input';
import { useLidoSDK } from 'providers/sdk';
import { useState } from 'react';

export const EventsDemo = () => {
  const [daysAgoValue, setDaysAgoValue] = useState<number>(1);
  const { events } = useLidoSDK();

  const [fromArgType, setFromArgType] = useState('from');
  const [to, setTo] = useBlockArgumentState();
  const [from, setFrom] = useBlockArgumentState(DEFAULT_FROM);
  const [back, setBack] = useBackArgumentState();
  const [step, setStep] = useState(50000);

  const eventProps = {
    to,
    step,
    back: fromArgType === 'back' ? back : undefined,
    from: fromArgType === 'from' ? from : undefined,
  } as any;

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
            days: daysAgoValue,
          })
        }
      >
        <Input
          label="Days ago"
          placeholder="7"
          type="number"
          min={1}
          value={daysAgoValue}
          onChange={(e) => setDaysAgoValue(e.target.valueAsNumber)}
        />
      </Action>
      <Action
        title="Last 10 Rebase events"
        action={() =>
          events.stethEvents.getLastRebaseEvents({
            count: 10,
          })
        }
      />
      <Action
        title="Last Rebase events by 7 days"
        action={() =>
          events.stethEvents.getRebaseEvents({ back: { days: BigInt(7) } })
        }
      />
      <Action
        action={() => events.stethEvents.getRebaseEvents(eventProps)}
        title="Get Rebase Events"
      >
        <BlockArgumentInput label="To" value={to} onChange={setTo} />
        <Select
          value={fromArgType}
          onChange={(value) => setFromArgType(String(value))}
        >
          <Option value={'from'}>From Argument</Option>
          <Option value={'back'}>Back Argument</Option>
        </Select>
        {fromArgType === 'back' && (
          <BackArgumentInput value={back} onChange={setBack} />
        )}
        {fromArgType === 'from' && (
          <BlockArgumentInput value={from} onChange={setFrom} />
        )}

        <Input
          label="Request block step"
          placeholder="default"
          min="1"
          type="number"
          value={step}
          onChange={(event) => setStep(event.currentTarget.valueAsNumber)}
        />
      </Action>
    </Accordion>
  );
};

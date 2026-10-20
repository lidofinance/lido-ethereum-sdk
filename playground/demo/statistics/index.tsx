import { ModuleSection } from 'components/module-section';
import { Input } from '@lidofinance/lido-ui';
import { Action } from 'components/action';
import { useLidoSDK } from 'providers/sdk';
import { useState } from 'react';

export const StatisticsDemo = () => {
  const [daysValue, setDaysValue] = useState<number>(0);
  const { statistics } = useLidoSDK();

  return (
    <ModuleSection title="Statistics">
      <Action title="Last Apr" action={() => statistics.apr.getLastApr()} />
      <Action
        title="SMA Apr"
        action={() =>
          statistics.apr.getSmaApr({
            days: daysValue,
          })
        }
      >
        <Input
          label="Days for APR"
          placeholder="7"
          type="number"
          min={0}
          value={daysValue}
          onChange={(e) => setDaysValue(e.target.valueAsNumber)}
        />
      </Action>
    </ModuleSection>
  );
};

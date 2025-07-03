import { useLidoSDK } from '../../providers/sdk';
import { Accordion, Input } from '@lidofinance/lido-ui';
import { Action } from '../../components/action';
import { useState } from 'react';

export const DualGovernanceDemo = () => {
  const [triggerPercent, setTriggerPercent] = useState(33);
  const { dualGovernance } = useLidoSDK();

  return (
    <Accordion summary="DualGovernance">
      <Action
        title="Get Dual Governance Warning status"
        action={() =>
          dualGovernance.getGovernanceWarningStatus({
            triggerPercent: triggerPercent,
          })
        }
      >
        <Input
          label="Trigger Percent"
          placeholder="33"
          type="number"
          min={0}
          value={triggerPercent}
          onChange={(e) => setTriggerPercent(e.target.valueAsNumber)}
        />
      </Action>
    </Accordion>
  );
};

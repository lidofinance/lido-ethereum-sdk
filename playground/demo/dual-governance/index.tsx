import { ModuleSection } from 'components/module-section';
import { useLidoSDK } from '../../providers/sdk';
import { Input } from '@lidofinance/lido-ui';
import { Action } from '../../components/action';
import { useState } from 'react';

export const DualGovernanceDemo = () => {
  const [triggerPercent, setTriggerPercent] = useState(33);
  const { dualGovernance } = useLidoSDK();

  return (
    <ModuleSection title="Dual Governance">
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
    </ModuleSection>
  );
};

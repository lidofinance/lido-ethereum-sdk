import {
  Input,
  Accordion,
  Select,
  Option,
  Checkbox,
} from '@lidofinance/lido-ui';
import { Action } from 'components/action';
import { useAddressState } from 'hooks/useAddressState';
import { useLidoSDK } from 'providers/sdk';
import { useState } from 'react';

import { Address } from 'viem';
import { renderRewards } from './rewards-table';
import {
  BlockArgumentInput,
  DEFAULT_FROM,
  useBlockArgumentState,
} from 'components/block-argument-input';
import {
  BackArgumentInput,
  useBackArgumentState,
} from 'components/back-argument-input';

export const RewardsDemo = () => {
  const [rewardsAddress, setRewardsAddress] = useAddressState(undefined, {
    useAccount: true,
  });
  const [fromArgType, setFromArgType] = useState('back');
  const [to, setTo] = useBlockArgumentState();
  const [from, setFrom] = useBlockArgumentState(DEFAULT_FROM);
  const [back, setBack] = useBackArgumentState();
  const [step, setStep] = useState(50000);
  const [includeZeroRebases, setIncludeZeroRebases] = useState(false);
  const [includeOnlyRebases, setIncludeOnlyRebases] = useState(false);
  const { rewards } = useLidoSDK();

  const rewardsProps = {
    address: rewardsAddress,
    to,
    back: fromArgType === 'back' ? back : undefined,
    from: fromArgType === 'from' ? from : undefined,
    step,
    includeOnlyRebases,
    includeZeroRebases,
  } as any;

  return (
    <Accordion summary="Rewards">
      <Action
        title="Get Rewards From Chain"
        renderResult={renderRewards}
        action={() => {
          return rewards.getRewardsFromChain({
            ...rewardsProps,
            stepBlock: step,
          });
        }}
      >
        <Input
          label="Rewards address"
          placeholder="0x0000000"
          value={rewardsAddress}
          onChange={(event) =>
            setRewardsAddress(event.currentTarget.value as Address)
          }
        />
        <BlockArgumentInput label="To" value={to} onChange={setTo} />
        <Select
          value={fromArgType}
          onChange={(value) => setFromArgType(String(value))}
        >
          <Option value={'from'}>From Argument</Option>
          <Option value={'back'}>Back Argument</Option>
        </Select>
        {fromArgType === 'back' && (
          <BackArgumentInput label="Back" value={back} onChange={setBack} />
        )}
        {fromArgType === 'from' && (
          <BlockArgumentInput label="From" value={from} onChange={setFrom} />
        )}

        <Input
          label="Request block step (for chain method)"
          placeholder="default"
          min="1"
          type="number"
          value={step}
          onChange={(event) => setStep(event.currentTarget.valueAsNumber)}
        />
        <Checkbox
          label="Include Zero Rebases"
          checked={includeZeroRebases}
          onChange={(event) =>
            setIncludeZeroRebases(event.currentTarget.checked)
          }
        />
        <Checkbox
          label="Include ONLY Rebases"
          checked={includeOnlyRebases}
          onChange={(event) =>
            setIncludeOnlyRebases(event.currentTarget.checked)
          }
        />
      </Action>
      <Action
        action={() => {
          return rewards.getRewardsFromSubgraph({
            ...rewardsProps,
            // Warning! these endpoints will be deprecated
            getSubgraphUrl(_, chainId) {
              switch (chainId) {
                case 1:
                  return 'https://api.thegraph.com/subgraphs/name/lidofinance/lido';
                case 5:
                  return 'https://api.thegraph.com/subgraphs/name/lidofinance/lido-testnet';
                default:
                  throw new Error('unsupported chain');
              }
            },
          });
        }}
        renderResult={renderRewards}
        title="Get Rewards From Subgraph"
      ></Action>
    </Accordion>
  );
};

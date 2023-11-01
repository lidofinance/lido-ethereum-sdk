import {
  GetRewardsFromChainResult,
  GetRewardsFromSubgraphResult,
} from '@lidofinance/lido-ethereum-sdk/dist/types/rewards/types';
import {
  Input,
  Accordion,
  Table,
  Thead,
  Tbody,
  Tr,
  Td,
  Th,
  Container,
  DataTableRow,
} from '@lidofinance/lido-ui';
import { Action, renderTokenResult } from 'components/action';
import { ToggleButton } from 'components/toggle-button/toggle-button';
import { useAddressState } from 'hooks/useAddressState';
import { useLidoSDK } from 'providers/sdk';
import { useState } from 'react';

import { Address } from 'viem';

const renderRewards = (
  result: GetRewardsFromChainResult | GetRewardsFromSubgraphResult,
) => {
  const steth = renderTokenResult('stETH');
  const shares = renderTokenResult('shares');
  return (
    <Container style={{ overflowX: 'scroll' }}>
      <DataTableRow title={'From Block:'}>
        {result.fromBlock.toString()}
      </DataTableRow>
      <DataTableRow title={'To Block'}>
        {result.toBlock.toString()}
      </DataTableRow>
      {'lastIndexedBlock' in result ? (
        <DataTableRow title={'Last Indexed Block'}>
          {result.lastIndexedBlock.toString()}
        </DataTableRow>
      ) : null}
      <DataTableRow title={'Initial Balance'}>
        {steth(result.baseBalance)}
      </DataTableRow>
      <DataTableRow title={'Initial Balance Shares'}>
        {shares(result.baseBalanceShares)}
      </DataTableRow>
      <DataTableRow title={'Initial Share Rate'}>
        {result.baseShareRate}
      </DataTableRow>
      <DataTableRow title={'Total Rewards'}>
        {steth(result.totalRewards)}
      </DataTableRow>
      {result.rewards.length > 0 ? (
        <Table>
          <Thead>
            <Tr>
              <Th>Block</Th>
              <Th>Type</Th>
              <Th>Balance</Th>
              <Th>Reward</Th>
              <Th>APR</Th>
            </Tr>
          </Thead>
          <Tbody>
            {result.rewards.map((r, index) => (
              <Tr key={index}>
                <Td>
                  {'block' in r.originalEvent
                    ? r.originalEvent.block
                    : r.originalEvent.blockNumber.toString()}
                </Td>
                <Td>{r.type}</Td>
                <Td>
                  {steth(r.balance)}
                  <br />({shares(r.balanceShares)})
                </Td>
                <Td>
                  {steth(r.change)}
                  <br />({shares(r.changeShares)})
                </Td>
                <Td>{r.apr ? `${r.apr * 100}%` : '-'}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      ) : (
        <DataTableRow title={'No Rewards for this range'}></DataTableRow>
      )}
    </Container>
  );
};

export const RewardsDemo = () => {
  const [rewardsAddress, setRewardsAddress] = useAddressState(undefined, {
    useAccount: true,
  });
  const [blocksBack, setBlocksBack] = useState(100000);
  const [step, setStep] = useState(50000);
  const [includeZeroRebases, setIncludeZeroRebases] = useState(false);
  const [includeOnlyRebases, setIncludeOnlyRebases] = useState(false);
  const { rewards } = useLidoSDK();

  const rewardsProps = {
    address: rewardsAddress,
    back: { blocks: BigInt(blocksBack) },
    step,
    includeOnlyRebases,
    includeZeroRebases,
  };

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
        <Input
          label="Blocks back"
          placeholder="1"
          min="1"
          type="number"
          value={blocksBack}
          onChange={(event) => setBlocksBack(event.currentTarget.valueAsNumber)}
        />
        <Input
          label="Request block step (for chain method)"
          placeholder="default"
          min="1"
          type="number"
          value={step}
          onChange={(event) => setStep(event.currentTarget.valueAsNumber)}
        />
        <ToggleButton
          title="Include Zero Rebases"
          value={includeZeroRebases}
          onChange={setIncludeZeroRebases}
        />
        <ToggleButton
          title="Include ONLY Rebases"
          value={includeOnlyRebases}
          onChange={setIncludeOnlyRebases}
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

import type {
  GetRewardsFromChainResult,
  GetRewardsFromSubgraphResult,
} from '@lidofinance/lido-ethereum-sdk';
import {
  Container,
  DataTableRow,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
} from '@lidofinance/lido-ui';
import { renderTokenResult } from 'components/action';
import { useMemo, useState } from 'react';

const RewardsTable = ({
  result,
}: {
  result: GetRewardsFromChainResult | GetRewardsFromSubgraphResult;
}) => {
  const [sortBlocks, setSortBlocks] = useState<'asc' | 'dsc'>('dsc');
  const steth = renderTokenResult('stETH');
  const shares = renderTokenResult('shares');

  const changeSteth = renderTokenResult('stETH', {
    colorCoded: true,
    alwaysShowSign: true,
  });
  const changeShares = renderTokenResult('shares', {
    colorCoded: true,
    alwaysShowSign: true,
  });

  const sortedRewards = useMemo(() => {
    return sortBlocks === 'asc'
      ? result.rewards
      : [...result.rewards].reverse();
  }, [result, sortBlocks]);

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
      {sortedRewards.length > 0 ? (
        <Table>
          <Thead>
            <Tr>
              <Th
                onClick={() =>
                  setSortBlocks(sortBlocks === 'asc' ? 'dsc' : 'asc')
                }
              >
                Block {sortBlocks === 'asc' ? '↑' : '↓'}
              </Th>
              <Th>Type</Th>
              <Th>Balance</Th>
              <Th>Rewards(Change)</Th>
              <Th>APR</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sortedRewards.map((r, index) => (
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
                  {changeSteth(r.change)}
                  <br />({changeShares(r.changeShares)})
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

export const renderRewards = (
  result: GetRewardsFromChainResult | GetRewardsFromSubgraphResult,
) => <RewardsTable result={result} />;

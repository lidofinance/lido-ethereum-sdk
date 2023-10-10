import { GetRewardsResult } from '@lidofinance/lido-ethereum-sdk/dist/types/rewards/types';
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
import { useWeb3 } from '@reef-knot/web3-react';
import { Action, renderTokenResult } from 'components/action';
import { DEFAULT_VALUE, ValueType } from 'components/tokenInput';
import TokenInput from 'components/tokenInput/tokenInput';
import { useAddressState } from 'hooks/useAddressState';
import { useLidoSDK } from 'providers/sdk';
import { useState } from 'react';
import { transactionToast } from 'utils/transaction-toast';
import { Address } from 'viem';

const renderRewards = (result: GetRewardsResult) => {
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
      <DataTableRow title={'Initial Balance'}>
        {steth(result.baseBalance)}
      </DataTableRow>
      <DataTableRow title={'Initial Balance Shares'}>
        {shares(result.baseBalanceShares)}
      </DataTableRow>
      <DataTableRow title={'Initial Share Rate'}>
        {result.baseShareRate}
      </DataTableRow>
      <Table>
        <Thead>
          <Tr>
            <Th>Block</Th>
            <Th>Type</Th>
            <Th>Balance</Th>
            <Th>Reward</Th>
          </Tr>
        </Thead>
        <Tbody>
          {result.rewards.map((r, index) => (
            <Tr key={index}>
              <Td>{r.originalEvent.blockNumber.toString()}</Td>
              <Td>{r.type}</Td>
              <Td>
                {steth(r.balance)}
                <br />({shares(r.balanceShares)})
              </Td>
              <Td>
                {steth(r.change)}
                <br />({shares(r.changeShares)})
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Container>
  );
};

export const RewardsDemo = () => {
  const [rewardsAddress, setRewardsAddress] = useAddressState(undefined, {
    useAccount: true,
  });
  const [blocksBack, setBlocksBack] = useState(10000);
  const { rewards } = useLidoSDK();

  return (
    <Accordion summary="Rewards">
      <Action
        title="Get Rewards From Chain"
        renderResult={renderRewards}
        action={() => {
          return rewards.getRewardsFromChain({
            address: rewardsAddress,
            blocksBack: BigInt(blocksBack),
          });
        }}
      >
        <Input
          label="Rewards address"
          placeholder="0x0000000"
          value={rewardsAddress}
          onChange={(e) => setRewardsAddress(e.currentTarget.value as Address)}
        />
        <Input
          label="Blocks back"
          placeholder="1"
          min="1"
          type="number"
          value={blocksBack}
          onChange={(e) => setBlocksBack(e.currentTarget.valueAsNumber)}
        />
      </Action>
    </Accordion>
  );
};

import { DataTableRow } from '@lidofinance/lido-ui';
import { Chain, GetBlockReturnType } from 'viem';
import { SuccessMessage } from './styles';

type Block = GetBlockReturnType<Chain, false, 'latest'>;

export const renderBlockResult = (block: Block) => {
  return (
    <SuccessMessage>
      <DataTableRow title="Block number">
        {block.number.toString()}
      </DataTableRow>
      <DataTableRow title="Block timestamp">
        {block.timestamp.toString()}(
        {new Date(Number(block.timestamp) * 1000).toLocaleString()})
      </DataTableRow>
    </SuccessMessage>
  );
};

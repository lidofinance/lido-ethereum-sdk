import { useWeb3 } from 'reef-knot/web3-react';
import { Accordion, Button, DataTableRow, Input } from '@lidofinance/lido-ui';
import { useCustomRpc } from 'providers/web3';
import { useEffect, useState } from 'react';
import { Controls, StyledBlock } from './styles';
import { dynamics } from 'config';

export const CustomRpcInput = () => {
  const { chainId = dynamics.defaultChain } = useWeb3();
  const { activeRpc, setCustomRpcUrl, customRpc } = useCustomRpc();
  const [url, setUrl] = useState('');

  const isDefault = activeRpc[chainId] !== customRpc[chainId];

  useEffect(() => {
    const customUrl = customRpc[chainId] ?? '';
    setUrl(customUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId]);

  return (
    <Accordion summary="Custom RPC">
      <StyledBlock>
        <Input
          value={url}
          onChange={(e) => setUrl(e.currentTarget.value)}
          label={`RPC Url for chain ${chainId}`}
        />
        <Controls>
          <Button
            disabled={!url}
            fullwidth
            onClick={() => setCustomRpcUrl(chainId, url)}
          >
            Save
          </Button>
          <Button fullwidth onClick={() => setCustomRpcUrl(chainId, null)}>
            Reset
          </Button>
        </Controls>

        <DataTableRow title="Current RPC">
          {isDefault ? 'default' : 'custom'}
        </DataTableRow>
      </StyledBlock>
    </Accordion>
  );
};

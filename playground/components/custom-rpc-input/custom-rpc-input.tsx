import { useWeb3 } from 'reef-knot/web3-react';
import {
  Button,
  DataTableRow,
  Input,
  Modal,
  ModalProps,
} from '@lidofinance/lido-ui';
import { useCustomRpc } from 'providers/web3';
import { FC, useEffect, useState } from 'react';
import { Controls, StyledBlock } from './styles';
import { dynamics } from 'config';

/** Whether the current chain uses a user-provided RPC url. */
export const useIsCustomRpc = () => {
  const { chainId = dynamics.defaultChain } = useWeb3();
  const { activeRpc, customRpc } = useCustomRpc();
  return !!customRpc[chainId] && activeRpc[chainId] === customRpc[chainId];
};

export const CustomRpcInput = () => {
  const { chainId = dynamics.defaultChain } = useWeb3();
  const { setCustomRpcUrl, customRpc } = useCustomRpc();
  const isCustom = useIsCustomRpc();
  const [url, setUrl] = useState('');

  useEffect(() => {
    const customUrl = customRpc[chainId] ?? '';
    setUrl(customUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId]);

  return (
    <StyledBlock>
      <Input
        fullwidth
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
        <Button
          fullwidth
          variant="outlined"
          onClick={() => {
            setCustomRpcUrl(chainId, null);
            setUrl('');
          }}
        >
          Reset
        </Button>
      </Controls>

      <DataTableRow title="Current RPC">
        {isCustom ? 'custom' : 'default'}
      </DataTableRow>
    </StyledBlock>
  );
};

export const CustomRpcModal: FC<ModalProps> = (props) => (
  <Modal title="Custom RPC" {...props}>
    <CustomRpcInput />
  </Modal>
);

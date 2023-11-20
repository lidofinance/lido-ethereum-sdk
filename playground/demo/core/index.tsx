import { useCallback, useEffect, useState } from 'react';
import { useWeb3 } from '@reef-knot/web3-react';
import { Input, Accordion } from '@lidofinance/lido-ui';
import { Action, renderTokenResult } from 'components/action';
import { useLidoSDK } from 'providers/sdk';
import { renderBlockResult } from 'components/action/render-block-result';

const locale = new Intl.Locale('en', { hourCycle: 'h24' });

export const CoreDemo = () => {
  const { core, stake } = useLidoSDK();
  const { account: web3account = '0x0' } = useWeb3();
  const [contractAddress, setContractAddress] = useState<string>('');
  const [timestampSeconds, setTimestampSeconds] = useState<string>('0');
  useEffect(() => {
    // for client only
    setTimestampSeconds(Math.floor(Date.now() / 1000).toString());
  }, []);
  const dateAtTimestamp = new Date(
    Number(timestampSeconds) * 1000,
  ).toLocaleString(locale);
  const getStethContract = useCallback(async () => {
    const address = await stake.contractAddressStETH();
    setContractAddress(address);
  }, [stake]);

  useEffect(() => {
    void getStethContract();
  }, [getStethContract]);

  const account = web3account as `0x{string}`;

  return (
    <Accordion summary="Core">
      <Action
        walletAction
        title="Get Web3 Address"
        action={async () => await core.getWeb3Address()}
      />
      <Action
        title="Get Fee Data"
        action={async () => await core.getFeeData()}
      />
      <Action
        title="Is Contract"
        action={() => core.isContract(contractAddress as `0x${string}`)}
      >
        <Input
          label="address"
          placeholder="0x0000000"
          value={contractAddress}
          onChange={(e) => setContractAddress(e.currentTarget.value)}
        />
      </Action>
      <Action
        walletAction
        title="Balance ETH"
        action={async () => await core.balanceETH(account)}
        renderResult={renderTokenResult('ETH')}
      />
      <Action
        title="Block by timestamp"
        renderResult={renderBlockResult}
        action={async () =>
          core.getLatestBlockToTimestamp(BigInt(timestampSeconds))
        }
      >
        <Input
          label={`timestamp at ${dateAtTimestamp}`}
          value={timestampSeconds}
          onChange={(e) => setTimestampSeconds(e.currentTarget.value)}
        />
      </Action>
    </Accordion>
  );
};

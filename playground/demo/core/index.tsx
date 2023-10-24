import { useCallback, useEffect, useState } from 'react';
import { useWeb3 } from '@reef-knot/web3-react';
import { Input, Accordion } from '@lidofinance/lido-ui';
import { Action } from 'components/action';
import { useLidoSDK } from 'providers/sdk';

export const CoreDemo = () => {
  const { core, stake } = useLidoSDK();
  const { account: web3account = '0x0' } = useWeb3();
  const [contractAddress, setContractAddress] = useState<string>('');

  const getStethContract = useCallback(async () => {
    const address = await stake.contractAddressStETH();
    setContractAddress(address);
  }, [stake]);

  useEffect(() => {
    getStethContract();
  }, [getStethContract]);

  const account = web3account as `0x{string}`;

  return (
    <Accordion summary="Core">
      <Action
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
        title="Balance ETH"
        action={async () => await core.balanceETH(account)}
      />
    </Accordion>
  );
};

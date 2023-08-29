import { Input, Section } from '@lidofinance/lido-ui';
import { useWeb3 } from '@reef-knot/web3-react/.';
import { Action } from 'components/action';
import { useLidoSDK } from 'providers/sdk';
import { useState } from 'react';

export const CoreDemo = () => {
  const { core, staking } = useLidoSDK();
  const [contractAddress, setContractAddress] = useState<string>(() =>
    staking.contractAddressStETH(),
  );
  return (
    <Section title="Core">
      <Action title="Get Fee Data" action={core.getFeeData} />
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
    </Section>
  );
};

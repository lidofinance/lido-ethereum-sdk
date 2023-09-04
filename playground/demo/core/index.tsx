import { useCallback, useEffect, useMemo, useState } from 'react';
import { Input, Section } from '@lidofinance/lido-ui';
import { Action } from 'components/action';
import { useLidoSDK } from 'providers/sdk';

export const CoreDemo = () => {
  const { core, staking } = useLidoSDK();
  const [contractAddress, setContractAddress] = useState<string>('');

  const getStethContract = useCallback(async () => {
    const address = await staking.contractAddressStETH();
    setContractAddress(address);
  }, [staking]);

  useEffect(() => {
    getStethContract();
  }, [getStethContract]);

  return (
    <Section title="Core">
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
    </Section>
  );
};

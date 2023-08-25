import { Button, Section } from '@lidofinance/lido-ui';
import { useLidoSDK } from 'providers/sdk';

export const StakeDemo = () => {
  const { staking } = useLidoSDK();

  return (
    <Section>
      <Button
        onClick={() => {
          staking.stake({ value: '0x1' });
        }}
      >
        Stake
      </Button>
    </Section>
  );
};

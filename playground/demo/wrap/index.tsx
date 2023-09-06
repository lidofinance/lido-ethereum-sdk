import { Input, Section } from '@lidofinance/lido-ui';
import { useWeb3 } from '@reef-knot/web3-react';
import { Action } from 'components/action';
import TokenInput from 'components/tokenInput/tokenInput';
import { useLidoSDK } from 'providers/sdk';
import { useState } from 'react';
import { transactionToast } from 'utils/transaction-toast';

export const WrapDemo = () => {
  const { account: web3account = '0x0' } = useWeb3();
  const [wrapValue, setWrapValue] = useState('0.001');
  const [wrapStethValue, setWrapStethValue] = useState('0.001');
  const { wrap } = useLidoSDK();

  const account = web3account as `0x{string}`;

  return (
    <Section title="Wrap">
      <Action
        title="Wrap ETH"
        action={() =>
          wrap.wrapEth({
            value: wrapValue,
            account,
            callback: transactionToast,
          })
        }
      >
        <TokenInput
          label="value"
          value={wrapValue}
          placeholder="0.0"
          onChange={(e) => setWrapValue(e.currentTarget.value)}
        />
      </Action>
      <Action
        title="Wrap stETH"
        action={() =>
          wrap.wrapSteth({
            value: wrapStethValue,
            account,
            callback: transactionToast,
          })
        }
      >
        <TokenInput
          label="value"
          value={wrapStethValue}
          placeholder="0.0"
          onChange={(e) => setWrapStethValue(e.currentTarget.value)}
        />
      </Action>
    </Section>
  );
};

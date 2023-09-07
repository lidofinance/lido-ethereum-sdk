import { Accordion } from '@lidofinance/lido-ui';
import { useWeb3 } from '@reef-knot/web3-react';
import { Action, renderTokenResult } from 'components/action';
import TokenInput from 'components/tokenInput/tokenInput';
import { useLidoSDK } from 'providers/sdk';
import { useState } from 'react';
import { transactionToast } from 'utils/transaction-toast';

export const WrapDemo = () => {
  const { account: web3account = '0x0' } = useWeb3();
  const [wrapValue, setWrapValue] = useState('0.001');
  const [approveValue, setApproveValue] = useState('0.001');
  const [wrapStethValue, setWrapStethValue] = useState('0.001');
  const [unwrapValue, setUnwrapValue] = useState('0.001');

  const [stethValue, setStethValue] = useState('0.001');
  const [wstethValue, setWstethValue] = useState('0.001');

  const { wrap } = useLidoSDK();

  const account = web3account as `0x{string}`;

  return (
    <Accordion summary="Wrap">
      <Action
        title="Wsteth Balance"
        renderResult={renderTokenResult('wstETH')}
        action={() => wrap.balanceWstETH(account)}
      />
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
        title="Get Approved stETH for Wrap"
        renderResult={renderTokenResult('stETH')}
        action={() => wrap.getStethForWrapAllowance(account)}
      />
      <Action
        title="Approve Steth For Wrap"
        action={() =>
          wrap.approveStethForWrap({
            value: approveValue,
            account,
            callback: transactionToast,
          })
        }
      >
        <TokenInput
          label="value"
          value={approveValue}
          placeholder="0.0"
          onChange={(e) => setApproveValue(e.currentTarget.value)}
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
      <Action
        title="Unwrap wstETH"
        action={() =>
          wrap.wrapSteth({
            value: unwrapValue,
            account,
            callback: transactionToast,
          })
        }
      >
        <TokenInput
          label="value"
          value={unwrapValue}
          placeholder="0.0"
          onChange={(e) => setUnwrapValue(e.currentTarget.value)}
        />
      </Action>
      <Action
        title="Convert wstETH->stETH"
        action={() => wrap.convertWstethToSteth(wstethValue)}
        renderResult={renderTokenResult('stETH')}
      >
        <TokenInput
          label="wsteth"
          value={wstethValue}
          placeholder="0.0"
          onChange={(e) => setWstethValue(e.currentTarget.value)}
        />
      </Action>
      <Action
        title="Convert stETH->wstETH"
        action={() => wrap.convertStethToWsteth(stethValue)}
        renderResult={renderTokenResult('wstETH')}
      >
        <TokenInput
          label="ssteth"
          value={stethValue}
          placeholder="0.0"
          onChange={(e) => setStethValue(e.currentTarget.value)}
        />
      </Action>
    </Accordion>
  );
};

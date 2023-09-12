import { Accordion } from '@lidofinance/lido-ui';
import { useWeb3 } from '@reef-knot/web3-react';
import { Action, renderTokenResult } from 'components/action';
import { DEFAULT_VALUE, ValueType } from 'components/tokenInput';
import TokenInput from 'components/tokenInput/tokenInput';
import { useLidoSDK } from 'providers/sdk';
import { useState } from 'react';
import { transactionToast } from 'utils/transaction-toast';

const ZERO = BigInt(0);

export const WrapDemo = () => {
  const { account: web3account = '0x0' } = useWeb3();
  const [wrapValue, setWrapValue] = useState<ValueType>(DEFAULT_VALUE);
  const [approveValue, setApproveValue] = useState<ValueType>(DEFAULT_VALUE);
  const [wrapStethValue, setWrapStethValue] =
    useState<ValueType>(DEFAULT_VALUE);
  const [unwrapValue, setUnwrapValue] = useState<ValueType>(DEFAULT_VALUE);

  const [stethValue, setStethValue] = useState<ValueType>(DEFAULT_VALUE);
  const [wstethValue, setWstethValue] = useState<ValueType>(DEFAULT_VALUE);

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
            value: wrapValue ?? ZERO,
            account,
            callback: transactionToast,
          })
        }
      >
        <TokenInput
          label="value"
          value={wrapValue}
          placeholder="0.0"
          onChange={setWrapValue}
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
            value: approveValue ?? ZERO,
            account,
            callback: transactionToast,
          })
        }
      >
        <TokenInput
          label="value"
          value={approveValue}
          placeholder="0.0"
          onChange={setApproveValue}
        />
      </Action>
      <Action
        title="Wrap stETH"
        action={() =>
          wrap.wrapSteth({
            value: wrapStethValue ?? ZERO,
            account,
            callback: transactionToast,
          })
        }
      >
        <TokenInput
          label="value"
          value={wrapStethValue}
          placeholder="0.0"
          onChange={setWrapStethValue}
        />
      </Action>
      <Action
        title="Unwrap wstETH"
        action={() =>
          wrap.wrapSteth({
            value: unwrapValue ?? ZERO,
            account,
            callback: transactionToast,
          })
        }
      >
        <TokenInput
          label="value"
          value={unwrapValue}
          placeholder="0.0"
          onChange={setUnwrapValue}
        />
      </Action>
      <Action
        title="Convert wstETH->stETH"
        action={() => wrap.convertWstethToSteth(wstethValue ?? ZERO)}
        renderResult={renderTokenResult('stETH')}
      >
        <TokenInput
          label="wsteth"
          value={wstethValue}
          placeholder="0.0"
          onChange={setWstethValue}
        />
      </Action>
      <Action
        title="Convert stETH->wstETH"
        action={() => wrap.convertStethToWsteth(stethValue ?? ZERO)}
        renderResult={renderTokenResult('wstETH')}
      >
        <TokenInput
          label="steth"
          value={stethValue}
          placeholder="0.0"
          onChange={setStethValue}
        />
      </Action>
    </Accordion>
  );
};

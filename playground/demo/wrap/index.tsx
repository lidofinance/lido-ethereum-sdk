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
        walletAction
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
        title="Wrap ETH Populate"
        walletAction
        action={() =>
          wrap.wrapEthPopulateTx({
            value: wrapValue ?? ZERO,
            account,
          })
        }
      />
      <Action
        title="Wrap ETH Estimate Gas(simulate)"
        walletAction
        action={() =>
          wrap.wrapEthEstimateGas({
            value: wrapValue ?? ZERO,
            account,
          })
        }
      />
      <Action
        title="Get Approved stETH for Wrap"
        walletAction
        renderResult={renderTokenResult('stETH')}
        action={() => wrap.getStethForWrapAllowance(account)}
      />
      <Action
        walletAction
        title="Approve stETH For Wrap"
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
        title="Approve stETH For Wrap Populate"
        walletAction
        action={() =>
          wrap.approveStethForWrapPopulateTx({
            value: approveValue ?? ZERO,
            account,
          })
        }
      />
      <Action
        title="Approve stETH For Wrap Simulate"
        walletAction
        action={() =>
          wrap.approveStethForWrapSimulateTx({
            value: approveValue ?? ZERO,
            account,
          })
        }
      />
      <Action
        walletAction
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
        title="Populate Wrap stETH"
        walletAction
        action={() =>
          wrap.wrapStethPopulateTx({
            value: wrapStethValue ?? ZERO,
            account,
          })
        }
      />
      <Action
        title="Simulate Wrap stETH"
        walletAction
        action={() =>
          wrap.wrapStethSimulateTx({
            value: wrapStethValue ?? ZERO,
            account,
          })
        }
      />
      <Action
        walletAction
        title="Unwrap wstETH"
        action={() =>
          wrap.unwrap({
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
        title="Populate unwrap"
        walletAction
        action={() =>
          wrap.unwrapPopulateTx({
            value: unwrapValue ?? ZERO,
            account,
          })
        }
      />
      <Action
        title="Simulate unwrap"
        walletAction
        action={() =>
          wrap.unwrapSimulateTx({
            value: wrapStethValue ?? ZERO,
            account,
          })
        }
      />
      <Action
        title="Convert wstETH->stETH"
        action={() => wrap.convertWstethToSteth(wstethValue ?? ZERO)}
        renderResult={renderTokenResult('stETH')}
      >
        <TokenInput
          label="wstETH"
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
          label="stETH"
          value={stethValue}
          placeholder="0.0"
          onChange={setStethValue}
        />
      </Action>
    </Accordion>
  );
};

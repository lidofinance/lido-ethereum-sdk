import { Accordion } from '@lidofinance/lido-ui';

import { Action, renderTokenResult } from 'components/action';
import { DEFAULT_VALUE, ValueType } from 'components/tokenInput';
import TokenInput from 'components/tokenInput/tokenInput';
import { useLidoSDK } from 'providers/sdk';
import { useState } from 'react';
import { transactionToast } from 'utils/transaction-toast';

const ZERO = BigInt(0);

export const WrapL2Demo = () => {
  const [wstethValue, setWstethValue] = useState<ValueType>(DEFAULT_VALUE);
  const [stethValue, setStethValue] = useState<ValueType>(DEFAULT_VALUE);

  const { l2 } = useLidoSDK();

  return (
    <Accordion summary="L2 Wrap">
      <Action
        title="Get wstETH balance"
        walletAction
        renderResult={renderTokenResult('wstETH')}
        action={() => l2.wsteth.balance()}
      />
      <Action
        title="Get stETH balance"
        walletAction
        renderResult={renderTokenResult('stETH')}
        action={() => l2.steth.balance()}
      />
      <Action
        title="Get Approved wstETH for Wrap to stETH"
        walletAction
        renderResult={renderTokenResult('wstETH')}
        action={() => l2.getWstethForWrapAllowance()}
      />
      <Action
        walletAction
        title="Approve wstETH For Wrap to stETH"
        action={() =>
          l2.approveWsethForWrap({
            value: wstethValue ?? ZERO,

            callback: transactionToast,
          })
        }
      >
        <TokenInput
          label="wstETH amount for approve&wrap"
          value={wstethValue}
          placeholder="0.0"
          onChange={setWstethValue}
        />
      </Action>
      <Action
        walletAction
        title="Wrap wstETH to stETH"
        action={() =>
          l2.wrapWstethToSteth({
            value: wstethValue ?? ZERO,

            callback: transactionToast,
          })
        }
      />
      <Action
        title="Populate Wrap stETH"
        walletAction
        action={() =>
          l2.wrapWstethToStethPopulateTx({
            value: wstethValue ?? ZERO,
          })
        }
      />
      <Action
        title="Simulate Wrap stETH"
        walletAction
        action={() =>
          l2.wrapWstethToStethSimulateTx({
            value: wstethValue ?? ZERO,
          })
        }
      />

      <Action
        walletAction
        title="Unwrap stETH to wstETH"
        action={() =>
          l2.unwrap({
            value: stethValue ?? ZERO,

            callback: transactionToast,
          })
        }
      >
        <TokenInput
          label="value"
          value={stethValue}
          placeholder="0.0"
          onChange={setStethValue}
        />
      </Action>
      <Action
        title="Populate unwrap"
        walletAction
        action={() =>
          l2.unwrapPopulateTx({
            value: stethValue ?? ZERO,
          })
        }
      />
      <Action
        title="Simulate unwrap"
        walletAction
        action={() =>
          l2.unwrapSimulateTx({
            value: stethValue ?? ZERO,
          })
        }
      />
    </Accordion>
  );
};

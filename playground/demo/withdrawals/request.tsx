import { Accordion } from '@lidofinance/lido-ui';
import { useWeb3 } from '@reef-knot/web3-react';
import { Action, renderTokenResult } from 'components/action';
import TokenInput from 'components/tokenInput/tokenInput';
import { useLidoSDK } from 'providers/sdk';
import { useState } from 'react';
import { transactionToast } from 'utils/transaction-toast';
import { DEFAULT_VALUE, ValueType } from 'components/tokenInput';

const ZERO = BigInt(0);

export const WithdrawalsRequestDemo = () => {
  const { account: web3account = '0x0' } = useWeb3();
  const [requestValue, setRequestValue] = useState<ValueType>(DEFAULT_VALUE);
  const { withdraw } = useLidoSDK();

  const account = web3account as `0x{string}`;

  return (
    <Accordion summary="Withdraw requests">
      <TokenInput
        label="value"
        value={requestValue}
        placeholder="0.0"
        onChange={setRequestValue}
      />
      <Action
        title="Request stETH"
        action={() =>
          withdraw.request.requestByToken({
            account,
            requests: [requestValue ?? ZERO],
            token: 'stETH',
            callback: transactionToast,
          })
        }
      />
      <Action
        title="Request wstETH"
        action={() =>
          withdraw.request.requestByToken({
            account,
            requests: [requestValue ?? ZERO],
            token: 'wstETH',
            callback: transactionToast,
          })
        }
      />
      <Action
        title="Request stETH Without Permit"
        action={() =>
          withdraw.request.requestWithoutPermit({
            account,
            requests: [requestValue ?? ZERO],
            token: 'stETH',
            callback: transactionToast,
          })
        }
      />
      <Action
        title="Request wstETH Without Permit"
        action={() =>
          withdraw.request.requestWithoutPermit({
            account,
            requests: [requestValue ?? ZERO],
            token: 'wstETH',
            callback: transactionToast,
          })
        }
      />
      <Action
        title="Approve stETH"
        action={() =>
          withdraw.approval.approveSteth({
            account,
            amount: requestValue ?? ZERO,
          })
        }
      />
      <Action
        title="Approve wstETH"
        action={() =>
          withdraw.approval.approveWsteth({
            account,
            amount: requestValue ?? ZERO,
          })
        }
      />
      <Action
        title="Get allowance stETH"
        renderResult={renderTokenResult('stETH')}
        action={() =>
          withdraw.approval.getAllowanceByToken({ account, token: 'stETH' })
        }
      />
      <Action
        title="Get allowance wsStETH"
        action={() =>
          withdraw.approval.getAllowanceByToken({ account, token: 'wstETH' })
        }
        renderResult={renderTokenResult('wstETH')}
      />
      <Action
        title="Check stETH allowance by amount"
        action={() =>
          withdraw.approval.checkAllowanceSteth(requestValue ?? ZERO, account)
        }
      />
      <Action
        title="Check wstETH allowance by amount"
        action={() =>
          withdraw.approval.checkAllowanceWsteth(requestValue ?? ZERO, account)
        }
      />
    </Accordion>
  );
};

import { Accordion } from '@lidofinance/lido-ui';
import { useWeb3 } from '@reef-knot/web3-react';
import { Action } from 'components/action';
import TokenInput from 'components/tokenInput/tokenInput';
import { useLidoSDK } from 'providers/sdk';
import { useState } from 'react';
import { parseEther } from '@ethersproject/units';

export const WithdrawalsRequestDemo = () => {
  const { account: web3account = '0x0' } = useWeb3();
  const [requestValue, setRequestValue] = useState('0.001');
  const { withdrawals } = useLidoSDK();

  const account = web3account as `0x{string}`;

  return (
    <Accordion summary="Withdrawals requests">
      <Action
        title="Request stETH"
        action={() =>
          withdrawals.request({
            account,
            amount: requestValue,
            requests: [BigInt(parseEther(requestValue).toString())],
            token: 'stETH',
          })
        }
      >
        <TokenInput
          label="value"
          value={requestValue}
          placeholder="0.0"
          onChange={(e) => setRequestValue(e.currentTarget.value)}
        />
      </Action>
      <Action
        title="Request Without Permit"
        action={() =>
          withdrawals.requestWithoutPermit({
            account,
            requests: [BigInt(parseEther(requestValue).toString())],
            token: 'stETH',
          })
        }
      />
      <Action
        title="Approve stETH"
        action={() =>
          withdrawals.approval.approveSteth({
            account,
            amount: requestValue,
          })
        }
      />
      <Action
        title="Approve wstETH"
        action={() =>
          withdrawals.approval.approveWsteth({
            account,
            amount: requestValue,
          })
        }
      />
      <Action
        title="Get allowance stETH"
        action={() =>
          withdrawals.approval.getAllowanceByToken({ account, token: 'stETH' })
        }
      />
      <Action
        title="Get allowance wsStETH"
        action={() =>
          withdrawals.approval.getAllowanceByToken({ account, token: 'wstETH' })
        }
      />
      <Action
        title="Check stETH allowance by amount"
        action={() =>
          withdrawals.approval.checkApprovalSteth(requestValue, account)
        }
      />
      <Action
        title="Check wstETH allowance by amount"
        action={() =>
          withdrawals.approval.checkApprovalWsteth(requestValue, account)
        }
      />
    </Accordion>
  );
};

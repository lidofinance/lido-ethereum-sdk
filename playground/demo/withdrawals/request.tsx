import { Select, Option } from '@lidofinance/lido-ui';
import { useWeb3 } from 'reef-knot/web3-react';
import { Action, renderTokenResult } from 'components/action';
import { ActionGroup, ModuleSection } from 'components/module-section';
import TokenInput from 'components/tokenInput/tokenInput';
import { useLidoSDK } from 'providers/sdk';
import { useState } from 'react';
import { transactionToast } from 'utils/transaction-toast';
import { DEFAULT_VALUE, ValueType } from 'components/tokenInput';

const ZERO = BigInt(0);

export const WithdrawalsRequestDemo = () => {
  const { account: web3account = '0x0' } = useWeb3();
  const [requestValue, setRequestValue] = useState<ValueType>(DEFAULT_VALUE);
  const [token, setToken] = useState<'stETH' | 'wstETH'>('stETH');
  const amount = requestValue ?? ZERO;
  const { withdraw } = useLidoSDK();

  const account = web3account as `0x{string}`;

  return (
    <ModuleSection
      title="Withdrawal requests"
      description="sdk.withdraw.request / approval / waitingTime"
    >
      <ActionGroup
        title="Parameters"
        sticky
        description="Token and amount are used by every action on this page."
        params={
          <>
            <Select
              label="token"
              onChange={(token) => setToken(token as 'stETH' | 'wstETH')}
              value={token}
            >
              <Option value={'stETH'}>stETH</Option>
              <Option value={'wstETH'}>wstETH</Option>
            </Select>
            <TokenInput
              label="amount"
              value={requestValue}
              placeholder="0.0"
              onChange={setRequestValue}
            />
          </>
        }
      />
      <ActionGroup title="Request with permit">
        <Action
          title={`Request ${token} withdrawal (permit)`}
          walletAction
          action={() =>
            withdraw.request.requestWithdrawalWithPermit({
              account,
              amount,
              token,
              callback: transactionToast,
            })
          }
        />
        <Action
          title={`Request ${token} withdrawal (permit) populate`}
          walletAction
          action={async () => {
            const spender =
              await withdraw.contract.contractAddressWithdrawalQueue();
            const permit = await withdraw.core.signPermit({
              account,
              amount,
              spender,
              token,
            });
            return withdraw.request.requestWithdrawalWithPermitPopulateTx({
              account,
              amount,
              token,
              permit,
            });
          }}
        />
        <Action
          title={`Request ${token} withdrawal (permit) simulate`}
          walletAction
          action={async () => {
            const spender =
              await withdraw.contract.contractAddressWithdrawalQueue();
            const permit = await withdraw.core.signPermit({
              account,
              amount,
              spender,
              token,
            });
            return withdraw.request.requestWithdrawalWithPermitSimulateTx({
              account,
              amount,
              token,
              permit,
            });
          }}
        />
      </ActionGroup>
      <ActionGroup title="Approval">
        <Action
          title={`Get allowance ${token}`}
          walletAction
          renderResult={renderTokenResult(token)}
          action={() => withdraw.approval.getAllowance({ account, token })}
        />
        <Action
          title={`Check ${token} allowance by amount`}
          walletAction
          action={() =>
            withdraw.approval.checkAllowance({
              amount,
              account,
              token,
            })
          }
        />
        <Action
          title={`Approve ${token}`}
          walletAction
          action={() =>
            withdraw.approval.approve({
              account,
              token,
              amount,
            })
          }
        />
        <Action
          title={`Approve ${token} populate`}
          walletAction
          action={() =>
            withdraw.approval.approvePopulateTx({
              account,
              token,
              amount,
            })
          }
        />
        <Action
          title={`Approve ${token} simulate`}
          walletAction
          action={() =>
            withdraw.approval.approveSimulateTx({
              account,
              token,
              amount,
            })
          }
        />
      </ActionGroup>
      <ActionGroup title="Request (needs allowance)">
        <Action
          title={`Request ${token} (needs allowance)`}
          walletAction
          action={() =>
            withdraw.request.requestWithdrawal({
              account,
              amount,
              token,
              callback: transactionToast,
            })
          }
        />
        <Action
          title={`Request ${token} populate`}
          walletAction
          action={() =>
            withdraw.request.requestWithdrawalPopulateTx({
              account,
              amount,
              token,
            })
          }
        />
        <Action
          title={`Request ${token} simulate (needs allowance) `}
          walletAction
          action={() =>
            withdraw.request.requestWithdrawalSimulateTx({
              account,
              amount,
              token,
            })
          }
        />
      </ActionGroup>
      <ActionGroup title="Utilities">
        <Action
          title={`Split Amount to Requests`}
          walletAction
          action={() =>
            withdraw.request.splitAmountToRequests({
              amount,
              token,
            })
          }
        />

        <Action
          title={`Withdrawal Waiting Time By Amount`}
          walletAction
          action={() =>
            withdraw.waitingTime.getWithdrawalWaitingTimeByAmount({
              amount,
            })
          }
        />

        <Action
          title={`Withdrawal Waiting Time For Account Requests`}
          walletAction
          action={async () => {
            const ids = await withdraw.views.getWithdrawalRequestsIds({
              account,
            });
            return withdraw.waitingTime.getWithdrawalWaitingTimeByRequestIds({
              ids,
            });
          }}
        />
      </ActionGroup>
    </ModuleSection>
  );
};

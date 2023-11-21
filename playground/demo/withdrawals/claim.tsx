import { Checkbox, Accordion } from '@lidofinance/lido-ui';
import { useWeb3 } from '@reef-knot/web3-react';
import { RequestStatusWithId } from '@lidofinance/lido-ethereum-sdk';
import { Action } from 'components/action';
import { RequestsWrapper } from 'components/requestsWrapper';
import { useLidoSDK } from 'providers/sdk';
import { useState } from 'react';
import { transactionToast } from 'utils/transaction-toast';

export const WithdrawalsClaimDemo = () => {
  const { account: web3account = '0x0' } = useWeb3();
  const [requestsInfo, setRequestsInfo] = useState<{
    ethByRequests: readonly bigint[];
    ethSum: bigint;
    hints: readonly bigint[];
    requests: readonly RequestStatusWithId[];
  }>();
  const [selectedIds, setSelectedIds] = useState<bigint[]>([]);
  const { withdraw } = useLidoSDK();

  const account = web3account as `0x{string}`;

  return (
    <Accordion summary="Withdrawals claim">
      <Action
        walletAction
        title="Get claimable request info"
        action={async () => {
          const result =
            await withdraw.requestsInfo.getClaimableRequestsETHByAccount({
              account,
            });
          setRequestsInfo(result);
          setSelectedIds([]);
          return result;
        }}
      />
      <Action
        title="Claim selected requests"
        walletAction
        action={async () => {
          const result = await withdraw.claim.claimRequests({
            account,
            requestsIds: selectedIds ?? [],
            callback: transactionToast,
          });
          setSelectedIds([]);
          return result;
        }}
      >
        <RequestsWrapper>
          {requestsInfo?.requests.map((item) => (
            <Checkbox
              key={item.stringId}
              label={item.stringId}
              onChange={() => {
                if (selectedIds?.includes(item.id)) {
                  setSelectedIds(selectedIds.filter((id) => id !== item.id));
                } else {
                  setSelectedIds([...selectedIds, item.id]);
                }
              }}
            />
          ))}
        </RequestsWrapper>
      </Action>
      <Action
        title="Claim selected requests Populate"
        walletAction
        action={() =>
          withdraw.claim.claimRequestsPopulateTx({
            account,
            requestsIds: selectedIds ?? [],
          })
        }
      />
      <Action
        title="Claim selected requests Simulate"
        walletAction
        action={() =>
          withdraw.claim.claimRequestsSimulateTx({
            account,
            requestsIds: selectedIds ?? [],
          })
        }
      ></Action>
    </Accordion>
  );
};

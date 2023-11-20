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
    sortedIds: readonly bigint[];
  }>();
  const [selectedIds, setSelectedIds] = useState<bigint[]>();
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

          return result;
        }}
      />
      <Action
        title="Claim selected requests"
        walletAction
        action={() =>
          withdraw.claim.claimRequests({
            account,
            requestsIds: selectedIds ?? [],
            hints:
              requestsInfo?.hints.filter(
                (_, index) =>
                  selectedIds?.includes(requestsInfo?.sortedIds[index]),
              ) ?? [],
            callback: transactionToast,
          })
        }
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
                  setSelectedIds([...(selectedIds ?? []), item.id]);
                }
              }}
            />
          ))}
        </RequestsWrapper>
      </Action>
    </Accordion>
  );
};

import { Accordion } from '@lidofinance/lido-ui';
import { useWeb3 } from '@reef-knot/web3-react';
import { Action } from 'components/action';
import { useLidoSDK } from 'providers/sdk';

export const WithdrawalsViewsDemo = () => {
  const { account: web3account = '0x0' } = useWeb3();
  const { withdrawals } = useLidoSDK();

  const account = web3account as `0x{string}`;

  return (
    <Accordion summary="Withdrawals views">
      <Action
        title="Get request ids"
        action={() => withdrawals.views.getWithdrawalRequestsIds({ account })}
      />
      <Action
        title="Get last checkpoint index"
        action={() => withdrawals.views.getLastCheckpointIndex()}
      />
      <Action
        title="Get unfinalized stETH"
        action={() => withdrawals.views.getUnfinalizedStETH()}
      />
      <Action
        title="Get MIN stETH withdrawal amount"
        action={() => withdrawals.views.minStethWithdrawalAmount()}
      />
      <Action
        title="Get MAX stETH withdrawal amount"
        action={() => withdrawals.views.maxStethWithdrawalAmount()}
      />
      <Action title="Is paused" action={() => withdrawals.views.isPaused()} />
      <Action
        title="Is Bunker mode"
        action={() => withdrawals.views.isBunkerModeActive()}
      />
      <Action
        title="Is Turbo mode"
        action={() => withdrawals.views.isTurboModeActive()}
      />
    </Accordion>
  );
};

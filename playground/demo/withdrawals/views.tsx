import { Accordion } from '@lidofinance/lido-ui';
import { useWeb3 } from '@reef-knot/web3-react';
import { Action, renderTokenResult } from 'components/action';
import { useLidoSDK } from 'providers/sdk';

export const WithdrawalsViewsDemo = () => {
  const { account: web3account = '0x0' } = useWeb3();
  const { withdraw } = useLidoSDK();

  const account = web3account as `0x{string}`;

  return (
    <Accordion summary="Withdrawals views">
      <Action
        title="Get request ids"
        walletAction
        action={() => withdraw.views.getWithdrawalRequestsIds({ account })}
      />
      <Action
        title="Get last checkpoint index"
        action={() => withdraw.views.getLastCheckpointIndex()}
      />
      <Action
        title="Get unfinalized stETH"
        action={() => withdraw.views.getUnfinalizedStETH()}
        renderResult={renderTokenResult('stETH')}
      />
      <Action
        title="Get MIN stETH withdrawal amount"
        action={() => withdraw.views.minStethWithdrawalAmount()}
        renderResult={renderTokenResult('stETH')}
      />
      <Action
        title="Get MAX stETH withdrawal amount"
        action={() => withdraw.views.maxStethWithdrawalAmount()}
        renderResult={renderTokenResult('stETH')}
      />
      <Action
        title="Get MIN wstETH withdrawal amount"
        action={() => withdraw.views.minWStethWithdrawalAmount()}
        renderResult={renderTokenResult('stETH')}
      />
      <Action
        title="Get MAX wstETH withdrawal amount"
        action={() => withdraw.views.maxWStethWithdrawalAmount()}
        renderResult={renderTokenResult('stETH')}
      />
      <Action title="Is paused" action={() => withdraw.views.isPaused()} />
      <Action
        title="Is Bunker mode"
        action={() => withdraw.views.isBunkerModeActive()}
      />
      <Action
        title="Is Turbo mode"
        action={() => withdraw.views.isTurboModeActive()}
      />
    </Accordion>
  );
};

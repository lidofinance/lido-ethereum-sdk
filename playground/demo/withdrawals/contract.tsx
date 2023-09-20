import { Accordion } from '@lidofinance/lido-ui';
import { useWeb3 } from '@reef-knot/web3-react';
import { Action } from 'components/action';
import { useLidoSDK } from 'providers/sdk';

export const WithdrawalsContractDemo = () => {
  const { account: web3account = '0x0' } = useWeb3();
  const { withdraw } = useLidoSDK();

  const account = web3account as `0x{string}`;

  return (
    <Accordion summary="Withdrawal Queue contract">
      <Action
        title="Get withdrawal Queue contract address"
        action={() => withdraw.contract.contractAddressWithdrawalQueue()}
      />
    </Accordion>
  );
};

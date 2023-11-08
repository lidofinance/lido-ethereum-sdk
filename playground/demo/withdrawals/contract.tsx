import { Accordion } from '@lidofinance/lido-ui';
import { Action } from 'components/action';
import { useLidoSDK } from 'providers/sdk';

export const WithdrawalsContractDemo = () => {
  const { withdraw } = useLidoSDK();

  return (
    <Accordion summary="Withdrawal Queue contract">
      <Action
        title="Get withdrawal Queue contract address"
        action={() => withdraw.contract.contractAddressWithdrawalQueue()}
      />
    </Accordion>
  );
};

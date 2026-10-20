import { ModuleSection } from 'components/module-section';
import { Action } from 'components/action';
import { useLidoSDK } from 'providers/sdk';

export const WithdrawalsContractDemo = () => {
  const { withdraw } = useLidoSDK();

  return (
    <ModuleSection title="Withdrawal Queue contract">
      <Action
        title="Get withdrawal Queue contract address"
        action={() => withdraw.contract.contractAddressWithdrawalQueue()}
      />
    </ModuleSection>
  );
};

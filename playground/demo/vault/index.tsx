import { Input, Accordion } from '@lidofinance/lido-ui';
import { useWeb3 } from 'reef-knot/web3-react';
import { Action } from 'components/action';
import { DEFAULT_VALUE, ValueType } from 'components/tokenInput';
import TokenInput from 'components/tokenInput/tokenInput';
import { useLidoSDK } from 'providers/sdk';
import { useState } from 'react';
import { transactionToast } from 'utils/transaction-toast';
import type { Address } from 'viem';

export const VaultDemo = () => {
  const { account: web3account = '0x0' } = useWeb3();
  const [stakingValueState, setStakingValue] =
    useState<ValueType>(DEFAULT_VALUE);
  const stakingValue = stakingValueState ?? BigInt(0);
  const [referralAddressState, setReferralAddress] = useState('');
  const { vault } = useLidoSDK();

  const account = web3account as `0x{string}`;
  const referralAddress = referralAddressState
    ? (referralAddressState as `0x{string}`)
    : undefined;

  return (
    <Accordion summary="Vault">
      <Action
        title="Create Vault"
        walletAction
        action={() =>
          vault.createVault({
            account,
            confirmExpiry: BigInt(3600),
            nodeOperatorFeeBP: BigInt(1),
            defaultAdmin: account,
            nodeOperator: account,
            nodeOperatorManager: account,
            roleAssignments: [],
          })
        }
      />
      <Action
        title="Get Contract Vault Factory"
        action={async () => (await vault.getContractVaultFactory()).abi}
      />
    </Accordion>
  );
};

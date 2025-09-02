import { Accordion, Input } from '@lidofinance/lido-ui';
import { useWeb3 } from 'reef-knot/web3-react';
import { Action } from 'components/action';
import TokenInput, { DEFAULT_VALUE, ValueType } from 'components/tokenInput';
import { useLidoSDK } from 'providers/sdk';
import { useState } from 'react';
import type { Address } from 'viem';

export const VaultDemo = () => {
  const { account: web3account = '0x0' } = useWeb3();
  const { vaultFactory, vaultViewer, vault } = useLidoSDK();

  const [fundEthValue, setFundEthValue] = useState<ValueType>(DEFAULT_VALUE);
  const [fundAddress, setFundAddress] = useState<Address>('0x0');

  const account = web3account as `0x{string}`;

  return (
    <Accordion summary="Vault">
      <Action
        title="Create Vault"
        walletAction
        action={() =>
          vaultFactory.createVault({
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
        action={async () => (await vaultFactory.getContractVaultFactory()).abi}
      />

      <Action
        title="Get Vault List"
        walletAction
        action={async () => {
          const result = await vaultViewer.fetchConnectedVaults({
            account,
            page: 1,
            perPage: 10,
          });
          return { result };
        }}
      />

      <Action
        title="Fund"
        walletAction
        action={() =>
          vault.fund({
            account,
            vaultAddress: fundAddress,
            value: fundEthValue ?? BigInt(0),
          })
        }
      >
        <Input
          label="Vault address"
          placeholder="0x0000000"
          value={fundAddress}
          onChange={(e) => setFundAddress(e.currentTarget.value as Address)}
        />

        <TokenInput
          label="Vault amount"
          value={fundEthValue}
          placeholder="0.0"
          onChange={setFundEthValue}
        />
      </Action>
    </Accordion>
  );
};

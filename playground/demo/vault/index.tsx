import { Accordion, Input } from '@lidofinance/lido-ui';
import { useWeb3 } from 'reef-knot/web3-react';
import { Action } from 'components/action';
import TokenInput, { DEFAULT_VALUE, ValueType } from 'components/tokenInput';
import { useLidoSDK } from 'providers/sdk';
import { useState } from 'react';
import type { Address } from 'viem';
import { LidoSDKVaultEntity } from '@lidofinance/lido-ethereum-sdk';

export const VaultDemo = () => {
  const { account: web3account = '0x0' } = useWeb3();
  const account = web3account as `0x{string}`;
  const { vaultModule } = useLidoSDK();
  const { vaultFactory, vaultViewer, contracts } = vaultModule;

  const [fundEthValue, setFundEthValue] = useState<ValueType>(DEFAULT_VALUE);
  const [fundAddress, setFundAddress] = useState<Address>('0x0');
  const [vaults, setVaults] = useState<LidoSDKVaultEntity[]>([]);
  const vault = vaults[0];

  const [withdrawEthValue, setWithdrawEthValue] =
    useState<ValueType>(DEFAULT_VALUE);
  const [withdrawAddress, setWithdrawAddress] = useState<Address>(account);

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
        action={async () => (await contracts.getContractVaultFactory()).abi}
      />

      <Action
        title="Get Vault List Addresses"
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
        title="Get Vault Entities List"
        walletAction
        action={async () => {
          const result = await vaultViewer.fetchConnectedVaultEntities({
            account,
            page: 1,
            perPage: 10,
          });
          setVaults(result.data);
          return { result: result.data.length };
        }}
      />

      <Action
        title="Fund"
        walletAction
        action={() =>
          vault.fund({
            account,
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

      <Action
        title="Withdraw"
        walletAction
        action={() =>
          vault.withdraw({
            account,
            address: withdrawAddress,
            amount: withdrawEthValue ?? BigInt(0),
          })
        }
      >
        <Input
          label="Withdraw address"
          placeholder="0x0000000"
          value={withdrawAddress}
          onChange={(e) => setWithdrawAddress(e.currentTarget.value as Address)}
        />

        <TokenInput
          label="Withdraw amount"
          value={withdrawEthValue}
          placeholder="0.0"
          onChange={setWithdrawEthValue}
        />
      </Action>

      <Action
        title="Submit Report"
        walletAction
        action={() =>
          vault.submitReport({
            account,
          })
        }
      />
    </Accordion>
  );
};

import { Accordion, Input, Select, Option, Block } from '@lidofinance/lido-ui';
import { useWeb3 } from 'reef-knot/web3-react';
import { Action } from 'components/action';
import TokenInput, { DEFAULT_VALUE, ValueType } from 'components/tokenInput';
import { useLidoSDK } from 'providers/sdk';
import { useState } from 'react';
import type { Address } from 'viem';
import { LidoSDKVaultEntity } from '@lidofinance/lido-ethereum-sdk';
import { ActionBlock } from '../../components/action/styles';

export const VaultDemo = () => {
  const { account: web3account = '0x0' } = useWeb3();
  const account = web3account as `0x{string}`;
  const { vaultModule } = useLidoSDK();
  const { vaultFactory, vaultViewer, contracts } = vaultModule;

  const [fundEthValue, setFundEthValue] = useState<ValueType>(DEFAULT_VALUE);
  const [vaults, setVaults] = useState<LidoSDKVaultEntity[]>([]);
  const [currentVault, setCurrentVault] = useState<LidoSDKVaultEntity | null>(
    null,
  );

  const [withdrawEthValue, setWithdrawEthValue] =
    useState<ValueType>(DEFAULT_VALUE);
  const [withdrawAddress, setWithdrawAddress] = useState<Address>(account);

  return (
    <Accordion summary="Vault">
      <ActionBlock>
        <Select
          fullwidth
          label="Select current Vault"
          onChange={(v) =>
            setCurrentVault(vaultFactory.vaultFromAddress(v as Address))
          }
        >
          {vaults.map((vault) => (
            <Option
              key={vault.getVaultAddress()}
              value={vault.getVaultAddress()}
            >
              {vault.getVaultAddress()}
            </Option>
          ))}
        </Select>
      </ActionBlock>
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
          currentVault?.fund({
            account,
            value: fundEthValue ?? BigInt(0),
          })
        }
      >
        <TokenInput
          label="Fund amount"
          value={fundEthValue}
          placeholder="0.0"
          onChange={setFundEthValue}
        />
      </Action>

      <Action
        title="Withdraw"
        walletAction
        action={() =>
          currentVault?.withdraw({
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
          currentVault?.submitReport({
            account,
          })
        }
      />
    </Accordion>
  );
};

import {
  Accordion,
  Input,
  Select,
  Option,
  Checkbox,
} from '@lidofinance/lido-ui';
import { useWeb3 } from 'reef-knot/web3-react';
import { Action } from 'components/action';
import TokenInput, { DEFAULT_VALUE, ValueType } from 'components/tokenInput';
import { useLidoSDK } from 'providers/sdk';
import { useState } from 'react';
import type { Address } from 'viem';
import { LidoSDKVaultEntity, Token } from '@lidofinance/lido-ethereum-sdk';
import { ActionBlock } from '../../components/action/styles';

export const VaultDemo = () => {
  const { account: web3account = '0x0' } = useWeb3();
  const account = web3account as `0x{string}`;
  const { vaultModule } = useLidoSDK();
  const { vaultFactory, vaultViewer } = vaultModule;

  const [fundEthValue, setFundEthValue] = useState<ValueType>(DEFAULT_VALUE);
  const [vaults, setVaults] = useState<LidoSDKVaultEntity[]>([]);
  const [currentVault, setCurrentVault] = useState<LidoSDKVaultEntity | null>(
    null,
  );

  const [withdrawEthValue, setWithdrawEthValue] =
    useState<ValueType>(DEFAULT_VALUE);
  const [withoutConnectingToVaultHub, setWithoutConnectingToVaultHub] =
    useState<boolean>(false);
  const [confirmExpiry, setConfirmExpiry] = useState<number>(24 * 3600);
  const [nodeOperatorFee, setNodeOperatorFee] = useState<number>(2);
  const [withdrawAddress, setWithdrawAddress] = useState<Address>(account);
  const [minRecipient, setMinRecipient] = useState<Address>(account);
  const [mintEthValue, setMintEthValue] = useState<ValueType>(DEFAULT_VALUE);
  const [mintTokenValue, setMintTokenValue] = useState<Token>('steth');
  const [burnEthValue, setBurnEthValue] = useState<ValueType>(DEFAULT_VALUE);
  const [burnTokenValue, setBurnTokenValue] = useState<Token>('steth');
  const [approveEthValue, setApproveEthValue] =
    useState<ValueType>(DEFAULT_VALUE);
  const [approveTokenValue, setApproveTokenValue] = useState<Token>('steth');

  return (
    <Accordion summary="Vault">
      <ActionBlock>
        <Select
          fullwidth
          label="Select current Vault"
          value={currentVault?.getVaultAddress()}
          onChange={(v) =>
            setCurrentVault(vaultModule.vaultFromAddress(v as Address))
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
        title="Get Vault Entities List"
        walletAction
        action={async () => {
          const result = await vaultViewer.fetchConnectedVaultEntities({
            account,
            page: 1,
            perPage: 10,
          });
          setVaults(result.data);
          setCurrentVault(result.data[0]);
          return { result: result.data.length };
        }}
      />

      <Action
        title="Create Vault"
        walletAction
        action={async () => {
          const { result } = await vaultFactory.createVault({
            account,
            confirmExpiry: BigInt(confirmExpiry),
            nodeOperatorFeeBP: BigInt(nodeOperatorFee),
            defaultAdmin: account,
            nodeOperator: account,
            nodeOperatorManager: account,
            roleAssignments: [],
            withoutConnectingToVaultHub,
          });

          return {
            result: {
              vaultAddress: result?.getVaultAddress(),
            },
          };
        }}
      >
        <Input
          label="Node operator fee"
          type="number"
          placeholder="2"
          value={nodeOperatorFee}
          onChange={(e) => setNodeOperatorFee(+e.currentTarget.value)}
        />
        <Input
          label="Confirm expiry"
          type="number"
          placeholder="2"
          value={confirmExpiry}
          onChange={(e) => setConfirmExpiry(+e.currentTarget.value)}
        />
        <Checkbox
          onChange={() => setWithoutConnectingToVaultHub((v) => !v)}
          label="Create without connecting to vault hub"
        ></Checkbox>
      </Action>

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
        title="Mint"
        walletAction
        action={() =>
          currentVault?.mint({
            recipient: minRecipient,
            amount: mintEthValue ?? BigInt(0),
            token: mintTokenValue,
          })
        }
      >
        <Input
          label="Mint recipient"
          placeholder="0x0000000"
          value={minRecipient}
          onChange={(e) => setMinRecipient(e.currentTarget.value as Address)}
        />
        <Input
          label="Mint token"
          value={mintTokenValue}
          placeholder="steth"
          onChange={(e) => setMintTokenValue(e.currentTarget.value as Token)}
        />
        <TokenInput
          label="Mint amount"
          value={mintEthValue}
          placeholder="0.0"
          onChange={setMintEthValue}
        />
      </Action>

      <Action
        title="Approve"
        walletAction
        action={() =>
          currentVault?.approve({
            amount: approveEthValue ?? BigInt(0),
            token: 'steth',
          })
        }
      >
        <TokenInput
          label="Approve amount"
          value={approveEthValue}
          placeholder="0.0"
          onChange={setApproveEthValue}
        />
        <Input
          label="Approve token"
          value={approveTokenValue}
          placeholder="steth"
          onChange={(e) => setApproveTokenValue(e.currentTarget.value as Token)}
        />
      </Action>

      <Action
        title="Burn"
        walletAction
        action={() =>
          currentVault?.burn({
            amount: burnEthValue ?? BigInt(0),
            token: 'steth',
          })
        }
      >
        <TokenInput
          label="Burn amount"
          value={burnEthValue}
          placeholder="0.0"
          onChange={setBurnEthValue}
        />
        <Input
          label="Burn token"
          value={burnTokenValue}
          placeholder="steth"
          onChange={(e) => setBurnTokenValue(e.currentTarget.value as Token)}
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

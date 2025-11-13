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
import { useEffect, useState } from 'react';
import type { Address, Hash } from 'viem';
import {
  LidoSDKVaultEntity,
  Token,
  getEncodableContract,
} from '@lidofinance/lido-ethereum-sdk';
import { ActionBlock } from '../../components/action/styles';

export const StVaultDemo = () => {
  const { account: web3account = '0x0' } = useWeb3();
  const account = web3account as `0x{string}`;
  const { stVaultModule } = useLidoSDK();
  const { vaultFactory, vaultViewer, constants } = stVaultModule;

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
  const [role, setRole] = useState<Hash>();
  const [vaultRoleHashes, setVaultRoleHashes] = useState<Hash[]>([]);

  useEffect(() => {
    const fetchDataAsync = async () => {
      try {
        const ROLES = await constants.ROLES();
        setVaultRoleHashes(Object.values(ROLES));
      } catch (err) {
        console.error(err);
      }
    };

    void fetchDataAsync();
  }, [constants]);

  return (
    <Accordion summary="Vault">
      <ActionBlock>
        <Select
          fullwidth
          label="Select current Vault"
          value={currentVault?.getVaultAddress()}
          onChange={(v) =>
            setCurrentVault(stVaultModule.vaultFromAddress(v as Address))
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
        title="Fetch My Vaults List"
        walletAction
        action={async () => {
          const result = await vaultViewer.fetchVaultsByOwnerEntities({
            address: account,
          });
          setVaults(result.data);
          setCurrentVault(result.data[0]);
          return { result: result.totals };
        }}
      />

      <Action
        title="Create Vault"
        walletAction
        action={async () => {
          const { result } = await vaultFactory.createVault({
            account,
            confirmExpirySeconds: BigInt(confirmExpiry),
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
          currentVault?.submitLatestReport({
            account,
          })
        }
      />

      <Action
        title="Submit Report Simulate"
        walletAction
        action={() =>
          currentVault?.submitLatestReportSimulateTx({
            account,
            skipIsFresh: true,
          })
        }
      />

      <Action
        title="Get latest report"
        action={() => currentVault?.getLatestReport()}
      />

      <Action
        title="Get Role Members"
        walletAction
        action={async () => {
          if (currentVault && role) {
            return await vaultViewer.getRoleMembers({
              vaultAddress: currentVault.getVaultAddress(),
              roles: [role],
            });
          }
        }}
      >
        <Select
          fullwidth
          label="Select role"
          multiple
          onChange={(r) => {
            setRole(r as Hash);
          }}
        >
          {Array.from(vaultRoleHashes).map((role) => (
            <Option key={role} value={role}>
              {role}
            </Option>
          ))}
        </Select>
      </Action>

      <Action
        title="Disburse Node Operator Fee"
        walletAction
        action={() => currentVault?.disburseNodeOperatorFee({ account })}
      />

      <Action
        title="Read with submitreport simulation"
        walletAction
        action={async () => {
          if (currentVault) {
            const dashboard = await currentVault.getDashboardContract();
            const dashboardEncodable = getEncodableContract(dashboard);
            const preparedMethods = [
              dashboardEncodable.prepare.remainingMintingCapacityShares([
                BigInt(10),
              ]),
              dashboardEncodable.prepare.liabilityShares(),
            ];
            return stVaultModule.readWithLatestReport({
              vaultAddress: currentVault.getVaultAddress(),
              skipIsFresh: true,
              preparedMethods,
            });
          }
        }}
      ></Action>
    </Accordion>
  );
};

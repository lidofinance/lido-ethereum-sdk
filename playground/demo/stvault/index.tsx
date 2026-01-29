import {
  Accordion,
  Checkbox,
  Input,
  Option,
  Select,
} from '@lidofinance/lido-ui';
import { useWeb3 } from 'reef-knot/web3-react';
import { Action } from 'components/action';
import TokenInput, { DEFAULT_VALUE, ValueType } from 'components/tokenInput';
import { useLidoSDK } from 'providers/sdk';
import { useEffect, useState } from 'react';
import type { Address, Hash } from 'viem';
import {
  ERROR_CODE,
  getEncodableContract,
  LidoSDKVaultEntity,
  Role,
  RoleName,
  SDKError,
  Token,
} from '@lidofinance/lido-ethereum-sdk';
import { ActionBlock } from '../../components/action/styles';

export const StVaultDemo = () => {
  const { account: web3account = '0x0' } = useWeb3();
  const account = web3account as `0x{string}`;
  const { stVaultModule, core } = useLidoSDK();
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
  const [mintRecipient, setMintRecipient] = useState<Address>(account);
  const [mintEthValue, setMintEthValue] = useState<ValueType>(DEFAULT_VALUE);
  const [mintTokenValue, setMintTokenValue] = useState<Token>('steth');
  const [burnEthValue, setBurnEthValue] = useState<ValueType>(DEFAULT_VALUE);
  const [burnTokenValue, setBurnTokenValue] = useState<Token>('steth');
  const [approveEthValue, setApproveEthValue] =
    useState<ValueType>(DEFAULT_VALUE);
  const [approveTokenValue, setApproveTokenValue] = useState<Token>('steth');
  const [role, setRole] = useState<Hash>();
  const [vaultRoles, setVaultRoles] = useState<Role[]>([]);
  const [grantRoleHash, setGrantRoleHash] = useState<Hash>();
  const [grantRoleAddress, setGrantRoleAddress] = useState<Address>();

  const [defaultAdmin, setDefaultAdmin] = useState<Address>(account);
  const [nodeOperator, setNodeOperator] = useState<Address>(account);
  const [nodeOperatorManager, setNodeOperatorManager] =
    useState<Address>(account);

  useEffect(() => {
    const fetchDataAsync = async () => {
      try {
        const ROLES = await constants.ROLES();
        const roleKeys = Object.keys(ROLES);
        const roles: { name: string; hash: Hash }[] = roleKeys.map(
          (roleKey) => ({ name: roleKey, hash: ROLES[roleKey as RoleName] }),
        );

        setVaultRoles(roles);
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
            defaultAdmin,
            nodeOperator,
            nodeOperatorManager,
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
        <Input
          label="Default Admin"
          placeholder="0x0000000"
          value={defaultAdmin}
          onChange={(e) => setDefaultAdmin(e.currentTarget.value as Address)}
        />
        <Input
          label="Node Operator"
          placeholder="0x0000000"
          value={nodeOperator}
          onChange={(e) => setNodeOperator(e.currentTarget.value as Address)}
        />
        <Input
          label="Node Operator Manager"
          placeholder="0x0000000"
          value={nodeOperatorManager}
          onChange={(e) =>
            setNodeOperatorManager(e.currentTarget.value as Address)
          }
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
        <TokenInput
          label="Withdraw amount"
          value={withdrawEthValue}
          placeholder="0.0"
          onChange={setWithdrawEthValue}
        />
        <Input
          label="Withdraw address"
          placeholder="0x0000000"
          value={withdrawAddress}
          onChange={(e) => setWithdrawAddress(e.currentTarget.value as Address)}
        />
      </Action>

      <Action
        title="Mint"
        walletAction
        action={() =>
          currentVault?.mint({
            recipient: mintRecipient,
            amount: mintEthValue ?? BigInt(0),
            token: mintTokenValue,
          })
        }
      >
        <TokenInput
          label="Mint amount"
          value={mintEthValue}
          placeholder="0.0"
          onChange={setMintEthValue}
        />
        <Select
          fullwidth
          label="Mint token"
          value={mintTokenValue}
          onChange={(v) => setMintTokenValue(v as Token)}
        >
          <Option key={'steth'} value={'steth'}>
            {'steth'}
          </Option>
          <Option key={'wsteth'} value={'wsteth'}>
            {'wsteth'}
          </Option>
        </Select>
        <Input
          label="Mint recipient"
          placeholder="0x0000000"
          value={mintRecipient}
          onChange={(e) => setMintRecipient(e.currentTarget.value as Address)}
        />
      </Action>

      <Action
        title="Approve"
        walletAction
        action={() =>
          currentVault?.approve({
            amount: approveEthValue ?? BigInt(0),
            token: approveTokenValue,
          })
        }
      >
        <TokenInput
          label="Approve amount"
          value={approveEthValue}
          placeholder="0.0"
          onChange={setApproveEthValue}
        />
        <Select
          fullwidth
          label="Approve token"
          value={approveTokenValue}
          onChange={(v) => setApproveTokenValue(v as Token)}
        >
          <Option key={'steth'} value={'steth'}>
            {'steth'}
          </Option>
          <Option key={'wsteth'} value={'wsteth'}>
            {'wsteth'}
          </Option>
        </Select>
      </Action>

      <Action
        title="Burn"
        walletAction
        action={() =>
          currentVault?.burn({
            amount: burnEthValue ?? BigInt(0),
            token: burnTokenValue,
          })
        }
      >
        <TokenInput
          label="Burn amount"
          value={burnEthValue}
          placeholder="0.0"
          onChange={setBurnEthValue}
        />
        <Select
          fullwidth
          label="Burn token"
          value={burnTokenValue}
          onChange={(v) => setBurnTokenValue(v as Token)}
        >
          <Option key={'steth'} value={'steth'}>
            {'steth'}
          </Option>
          <Option key={'wsteth'} value={'wsteth'}>
            {'wsteth'}
          </Option>
        </Select>
      </Action>

      <Action
        title="Grant role"
        walletAction
        action={() => {
          if (!grantRoleHash || !grantRoleAddress) {
            throw new SDKError({
              code: ERROR_CODE.INVALID_ARGUMENT,
              message: 'Role and address required',
            });
          }

          return currentVault?.grantRoles({
            roles: [
              {
                role: grantRoleHash,
                account: grantRoleAddress,
              },
            ],
          });
        }}
      >
        <Input
          label="Address"
          placeholder="0x0000000"
          value={grantRoleAddress}
          onChange={(e) =>
            setGrantRoleAddress(e.currentTarget.value as Address)
          }
        />
        <Select
          fullwidth
          label="Select role"
          multiple
          onChange={(r) => {
            setGrantRoleHash(r as Hash);
          }}
        >
          {Array.from(vaultRoles).map((role) => (
            <Option key={role.hash} value={role.hash}>
              {role.name}
            </Option>
          ))}
        </Select>
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
          {Array.from(vaultRoles).map((role) => (
            <Option key={role.hash} value={role.hash}>
              {role.name}
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
        title="Read with latest report submit simulation"
        walletAction
        action={async () => {
          if (currentVault) {
            const dashboard = await currentVault.getDashboardContract();
            const blockNumber = await core.toBlockNumber({ block: 'latest' });
            const dashboardEncodable = getEncodableContract(dashboard);
            const operatorGridEncodable =
              await stVaultModule.contracts.getContractOperatorGrid();

            const preparedMethods = [
              dashboardEncodable.prepare.remainingMintingCapacityShares([
                BigInt(10),
              ]),
              dashboardEncodable.prepare.liabilityShares(),
              dashboard.prepare.totalMintingCapacityShares(),
              operatorGridEncodable.prepare.vaultTierInfo([
                currentVault.getVaultAddress(),
              ]),
            ];

            return stVaultModule.readWithLatestReport({
              vaultAddress: currentVault.getVaultAddress(),
              skipIsFresh: true,
              preparedMethods,
              blockNumber,
            });
          }
        }}
      >
        <small>
          Current example read with simulation:
          <ul>
            <li>remainingMintingCapacityShares</li>
            <li>liabilityShares</li>
            <li>totalMintingCapacityShares</li>
            <li>vaultTierInfo</li>
          </ul>
        </small>
      </Action>

      <Action
        title="Calculate Overview"
        walletAction
        action={async () => {
          if (currentVault) {
            const blockNumber = await core.toBlockNumber({ block: 'latest' });
            const vaultData = await currentVault.getVaultOverviewData({
              blockNumber,
            });

            const overview = currentVault.calculateOverview({
              ...vaultData,
              liabilitySharesInStethWei: vaultData.liabilityStETH,
              forceRebalanceThresholdBP: vaultData.forcedRebalanceThresholdBP,
              locked: vaultData.lockedEth,
              nodeOperatorDisbursableFee: vaultData.nodeOperatorUnclaimedFee,
              totalMintingCapacityStethWei: vaultData.totalMintingCapacityStETH,
              unsettledLidoFees:
                vaultData.cumulativeLidoFees - vaultData.settledLidoFees,
            });

            return {
              vaultData,
              overview,
            };
          }
        }}
      ></Action>
    </Accordion>
  );
};

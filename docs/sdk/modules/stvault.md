---
sidebar_position: 15
---

# StVault

The `stVault` module provides helpers to create vaults, read vault state, and
execute dashboard/vault actions.

## Access

```ts
import { LidoSDK, LidoSDKCore } from '@lidofinance/lido-ethereum-sdk';

const lidoSDK = new LidoSDK({
  rpcUrls: ['<RPC_URL>'],
  chainId: 1,
  web3Provider: LidoSDKCore.createWeb3Provider(1, window.ethereum),
});

const stVault = lidoSDK.stVaultModule;
```

## Module layout

- `stVault.vaultFactory` - vault creation methods
- `stVault.vaultViewer` - discovery and read-only list helpers
- `stVault.constants` - protocol constants and role hashes
- `stVault.lazyOracle` - report submission helpers
- `stVault.contracts` - low-level contract getters
- `stVault.vaultFromAddress(address, dashboardAddress?)` - create
  `LidoSDKVaultEntity` instance
- `stVault.readWithLatestReport(...)` - helper for multicall reads with
  lazy-oracle report update in the same call

## Create vault

Main method:
- `stVault.vaultFactory.createVault(props)`

Helpers:
- `stVault.vaultFactory.createVaultSimulateTx(props)`
- `stVault.vaultFactory.createVaultPopulateTx(props)`

```ts
const result = await stVault.vaultFactory.createVault({
  account,
  defaultAdmin: '<DEFAULT_ADMIN>',
  nodeOperator: '<NODE_OPERATOR>',
  nodeOperatorManager: '<NODE_OPERATOR_MANAGER>',
  nodeOperatorFeeBP: 200n,
  confirmExpirySeconds: 86400n,
  roleAssignments: [],
  withoutConnectingToVaultHub: false,
});

const vault = result.result;
const vaultAddress = vault.getVaultAddress();
```

## Find vaults

- `stVault.vaultViewer.fetchConnectedVaults({ perPage, page })`
- `stVault.vaultViewer.fetchConnectedVaultEntities({ perPage, page })`
- `stVault.vaultViewer.fetchVaultsByOwner({ address, scanLimit? })`
- `stVault.vaultViewer.fetchVaultsByOwnerEntities({ address, scanLimit? })`
- `stVault.vaultViewer.getRoleMembers({ vaultAddress, roles })`
- `stVault.vaultViewer.getRoleMembersBatch({ vaultAddresses, roles })`
- `stVault.vaultViewer.getVaultData({ vaultAddress })`

```ts
const ownedVaults = await stVault.vaultViewer.fetchVaultsByOwnerEntities({
  address: account,
});

const vault = ownedVaults.data[0];
```

## Vault entity methods

Create entity:

```ts
const vault = stVault.vaultFromAddress('<VAULT_ADDRESS>');
```

Address/contracts:
- `vault.getVaultAddress()`
- `vault.getDashboardAddress()`
- `vault.getVaultContract()`
- `vault.getDashboardContract()`

Value operations:
- `vault.fund({ value, account? })`
- `vault.withdraw({ address, amount, account? })`
- `vault.mint({ recipient, amount, token: 'steth' | 'wsteth', account? })`
- `vault.burn({ amount, token: 'steth' | 'wsteth', account? })`
- `vault.approve({ amount, token: 'steth' | 'wsteth', account? })`

Shares-specific:
- `vault.mintShares({ recipient, amountOfShares, account? })`
- `vault.burnShares({ amountOfShares, account? })`

Role management:
- `vault.grantRoles({ roles, account? })`
- `vault.revokeRoles({ roles, account? })`
- `vault.getRoleMembers({ role })`

Node operator fee:
- `vault.disburseNodeOperatorFee({ account? })`

Most transactional methods above also provide `SimulateTx` and `PopulateTx`
variants (for example `fundSimulateTx`, `fundPopulateTx`). `approve` is call-only.

## Reports and overview

Report methods:
- `vault.getLatestReport({ gateway? })`
- `vault.submitLatestReport({ account?, gateway?, skipIsFresh? })`
- `vault.submitLatestReportSimulateTx(...)`
- `vault.submitLatestReportPopulateTx(...)`

Overview/health:
- `vault.getVaultOverviewData({ blockNumber?, report? })`
- `vault.calculateOverview(overviewArgs)`
- `vault.calculateHealth({ totalValue, liabilitySharesInStethWei, forceRebalanceThresholdBP })`

```ts
const vaultData = await vault.getVaultOverviewData({});
const health = vault.calculateHealth({
  totalValue: vaultData.totalValue,
  liabilitySharesInStethWei: vaultData.liabilityStETH,
  forceRebalanceThresholdBP: vaultData.forcedRebalanceThresholdBP,
});
```

## Constants and roles

- `stVault.constants.CONNECT_DEPOSIT()`
- `stVault.constants.MIN_CONFIRM_EXPIRY()`
- `stVault.constants.MAX_CONFIRM_EXPIRY()`
- `stVault.constants.ROLES()`

```ts
const roles = await stVault.constants.ROLES();
const withdrawRole = roles.WITHDRAW_ROLE;
```

## Low-level contracts and ABIs

You can use preconfigured contract instances:

- `stVault.contracts.getContractVault(vaultAddress)`
- `stVault.contracts.getContractVaultDashboard(dashboardAddress)`
- `stVault.contracts.getContractVaultHub()`
- `stVault.contracts.getContractVaultFactory()`
- `stVault.contracts.getContractVaultViewer()`
- `stVault.contracts.getContractLazyOracle()`
- `stVault.contracts.getContractPredepositGuarantee()`
- `stVault.contracts.getContractOperatorGrid()`

`stvault` ABIs are exported and available under:
- `@lidofinance/lido-ethereum-sdk/stvault`

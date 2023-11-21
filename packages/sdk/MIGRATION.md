# Migrating from V2 -> V3

## Common

- `account` prop now accepts both `Address` and `Account` Viem object. Can also be skipped if account is hoisted to `WalletClient` passed as web3Provider
- some methods that did't previously use `web3Provider` but accepted `account` prop (like `populate...` or `simulate...`) now will require `web3Provider` if `account` prop is omitted in order to access possibly hoisted account
- All exports from individual modules are now available from root export `@lidofinance/lido-ethereum-sdk`
- For all modules constructor arguments typings are now more strict. Disallow incorrect combinations (e.g. `core` and `rpcUrls` at same time)
- All dedicated SDK modules now use `type LidoSDKCommonProps` for constructor options and no longer export separate type

## Core

- `defineWeb3Provider` and `setWeb3Provider` methods were removed.
- `web3Provider` is now immutable, to change it recreate SDK instance
- `createRpcProvider` and `createWeb3Provider` are now available as `LidoSDKCore` **static** methods with different signature. Can be used when calling constructors for SDK & modules.
- `getErrorMessage` was removed

Internal utilities:

- `getSubgraphId` now can return null when id not available for current chain
- `performTransaction` argument signature changed

## Stake

- `getStakeLimitInfo` now returns more informative object

## Events

- `getRebaseEventsByDays` was removed
- `getRebaseEvents` arguments signature was changed to fit wide range of use-cases, [see docs](./README.md#`getRebaseEvents`)
- `getLastRebaseEvents` covers previous use case of `getRebaseEvents`

## Rewards

`getRewards...` props signature changed to fit wide range of use cases [see docs](./README.md#Rewards)

Props:

- `to`, `from`, `back` props, [see docs](./README.md#Rewards).
- `step` prop was removed due to conflicting defaults. Replaced with `stepEntities`(defaults 1000) and `stepBlocks`(defaults 50000) for subgraph and chain methods accordingly.
- `getSubgraphUrl` now can receive subgraph id `null` for chains where it is not available

Results:

- `apr` is available for rebase events
- `totalRewards` now contains cumulative stETH rewards for queried period

## APR

- `LidoSDKApr.calculateAprFromRebaseEvent` static method now available to calculate APR based on rebase event

## Unsteth

- type `TransferProps` -> `UnstethTransferProps`
- type `ApproveAllProps` -> `UnstethApproveAllProps`
- type `ApproveProps` -> `UnstethApproveProps`
- type `ApprovedForProps` -> `UnstethApprovedForProps`
- type `IsApprovedForAllProps` -> `UnstethIsApprovedForAllProps`

Methods:

- `setApprovalFor` -> `setSingleTokenApproval`
- `getTokenApprovedFor`-> `getSingleTokenApproval`

- `setApprovalForAll` -> `setAllTokensApproval`
- `getIsApprovedForAll`-> `areAllTokensApproved`

## Withdraw

- setters for `core`, `views` and others were removed

### Claim

- hints are now optional, will be calculated on the spot
- you can pass request ids in any order, they will be sorted alongside corresponding hints

### Approve

Excessive methods removed:

- `approveEOA`
- `approveSteth`
- `approveWsteth`
- `approveByToken`
- `approveStethMultisig`
- `approveWstethMultisig`
- `approveMultisigByToken`
- `getAllowanceByToken`
- `checkAllowanceByToken`
- `checkAllowanceSteth`
- `checkAllowanceWsteth`

replaced with:

- `approve`
- `getAllowance`
- `checkAllowance`

For `checkAllowance`: `isNeedApprove` -> `isNeedApprove`

### Request

Most methods revamped:

- `requestWithdrawal` and `requestWithdrawalWithPermit` cover all previous functionality and more
- `permit` is optional, if omitted will be requested
- `amount` can be passed instead of `requests`, amount will be split into requests
- `splitAmountToRequests` helper is added and is used internally to split
- `populate` & `simulate` helpers are added

### Views

- `findCheckpointHints` prop `lastIndex` is optional defaults to `getLastCheckpointIndex()`

# 3.1.0

## SDK

### Fixed

- Mainnet subgraph ID now points to updated, L2 based subgraph

# 3.1.0

## SDK

### Added

- `viem` version up to `2.0.6`
- Account hoisting support: methods no longer require address/account if it's hoisted to `walletClient` or available via `eth_requestAccounts`
- Stake, Wrap, Withdraw Request & Claim transaction methods now return parsed transaction result
- `waitForTransactionReceiptParameters` [optional config](https://viem.sh/docs/actions/public/waitForTransactionReceipt.html) added to all transaction methods props

### Fixed

- better multisig behavior for transactions
- Simulate methods now have correct return types
- `stakeEthPopulateTx` not does not calculate `gasLimit` which prevented usage when stake limit is reached

## Playground

- Upped `next` and `viem` versions

# 3.0.1

## SDK

### Fixed

- modules constructors types did not allow `rpcProvider` passage
- increased default timeout on transaction confirmation
- account hoisting in `LidoSDKSteth` and `LidoSDKWSteth` for `signPermit` and `populatePermit`
- `LidoSDKRewards`:
  - `getRewardsFromSubgraph` now returns APR in correct units(not in percent)
  - `getRewardsFromSubgraph` now allows object to be returned from `getSubgraphUrl`
- `LidoSDKStatitstics` now has helper types
- `LidoSDKWithdraw`:
  - now has more exported types
  - `approveSimulateTx`,`requestWithdrawalSimulateTx`,`requestWithdrawalWithPermitSimulateTx` fixed account hoisting
  - `getClaimableRequestsETHByAccount` now returns only claimable requests

## Playground

- Playground now has custom RPC input

## Tests

- All modules are covered by unit tests

# 3.5.0

## Breaking change

- `viem` is no longer an internal dependency and is listed as peer dependency

## SDK

### Added

- `LidoSDKL2` module is added to support Lido on L2 networks functionality
- `Optimism` and `Optimism-sepolia` chains are added as separate L2 chains
- `core.getL2ContractAddress` and `LIDO_L2_CONTRACT_NAMES enum` are added to support l2 contracts
- ABIs are exported from corresponding modules to support custom functionality and direct viem access

### Fixed

- `multicall` is used only if supported by client

## Playground

- L2 and updated reef-knot support

# 3.4.0

## SDK

### Fixed

- `apr` in `getRewardsFromChain` and `getRewardsFromSubgraph` is now in percents e.g 3.14 and not 0.314
- package is build with ts@5.4.5 with changes in bundle
- `LidoSDKApr.calculateAprFromRebaseEvent` has increased precision

## Playground

### Fixed

- updated version of `reef-knot` package with `wagmi@2`

# 3.3.0

No changes

# 3.2.2

## SDK

### Fixed

- fixed edge-case in `withdraw.views.findCheckpointHints` where last finalized request would fail assertion with `Cannot find hints for unfinalized request...`
- subsequently fixed same error in `withdraw.request-info`, `withdraw.claim` modules

# 3.2.1

## SDK

### Fixed

- fixed edge-cases in `getRewardsFromChain` and `getRewardsFromSubgraph` sometimes causing transfer events to be wronged and leading to negative balance

# 3.2.0

## SDK

### Added

- `Sepolia` testnet
- New method `getWithdrawalWaitingTimeByAmount` for fetching withdrawal waiting time for amount of eth
- New method `getWithdrawalWaitingTimeByRequestIds` for fetching withdrawal waiting time for earlier created requests by their ids

## Playground

- Support for `Sepolia` testnet
- Added blocks with new methods `getWithdrawalWaitingTimeByAmount` and `getWithdrawalWaitingTimeByRequestIds`

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

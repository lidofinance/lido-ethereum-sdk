# 4.7.0

## SDK

### Added

- `StVault` module
- `viem` version up to `^2.45.0`
- `shares` module new methods:
  `convertBatchSharesToSteth`, `convertBatchStethToShares`,
  `getSharesByPooledEth`, `getPooledEthByShares`, `getPooledEthBySharesRoundUp`
- Updated ABIs:
  `stvault` ABIs (`StakingVault`, `VaultHub`, `VaultFactory`, `Dashboard`,
  `VaultViewer`, `PredepositGuarantee`, `OperatorGrid`, `LazyOracle`, `Multicall`),
  plus updates in `core` (`lido`, `lidoLocator`) and `shares` (`steth-shares`)

## Playground

- `StVault` module added

# 4.6.0

## SDK

- `wrapEth` logic is migrated from direct ETH transfers to calling `stakeETH` on the `WstETHReferralStaker` contract
- `wrapEth` now supports an optional `referralAddress` parameter

## Playground

- Support for referral address in `wrapEth` demo block

# 4.5.0

## SDK

### Added

- Dual Governance module

## Playground

- DualGovernance warning status

# 4.4.0

## SDK

### Added

- `Hoodi` testnet support
- `viem` version up to `^2.26.0`

## Playground

- `Hoodi` testnet support
- `viem` version up to `^2.26.0`

# 4.3.0

## SDK

### Added

- `Unichain`, `UnichainSepolia` L2 chains support

# 4.2.0

## SDK

### Added

- `Soneium` and `SoneiumMinato` chains are added as separate L2 chains
- `Goerli` chain is removed
- `viem` version up to `^2.22.11`

## Playground

- `Soneium` and `SoneiumMinato` chains are added as separate L2 chains
- `Goerli` chain is removed
- `viem` version up to `^2.22.11`

# 4.1.0

## SDK

### Added

- `TransactionCallback` can be async and are now awaited
- `TransactionCallbackStage.SIGN` stage in callback can now return custom gas limit that overrides estimated one
- `estimateTransfer` and `estimateApprove` for all (w)stETH instances
- `LidoSDKL2` now has `approveWstethForWrapEstimateGas`, `wrapWstethToStethEstimateGas`,`unwrapStethEstimateGas` helpers
- `LidoSDKStake` now has `stakeEthEstimateGas` helper
- `LidoSDKWrap` now has `wrapStethEstimateGas`, `approveStethForWrapEstimateGas` and `unwrapEstimateGas` helpers
- `LidoSDKWithdraw.claim` now has `claimRequestsEstimateGas` helper
- `LidoSDKWithdraw.request` now has `requestWithdrawalEstimateGas`,`requestWithdrawalWithPermitEstimateGas` helpers
- `LidoSDKWithdraw.request.requestWithdrawalWithPermit` now accepts custom `deadline` prop for permit signature

### Fixed

- `LIDO_CONTRACT_NAMES`, `LIDO_L2_CONTRACT_NAMES`, `LIDO_L2_CONTRACT_NAMES` can now be used directly as non-const enums
- `LidoLocatorAbi` is now exported from `core`
- `PopulatedTransaction` that is returned from `populateTX` helpers now only has relevant fields
- `LidoSDKWrap.wrapEthEstimateGas`now applies correct gas limit

# 4.0.1

## SDK

### Fixed

- `LidoSDKRewards` now filter outs edgecases with self-transfers

# 4.0.0

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

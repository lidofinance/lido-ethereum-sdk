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

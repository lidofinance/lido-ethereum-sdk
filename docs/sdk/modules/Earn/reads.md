---
sidebar_position: 2
---

# Earn reads and previews

Use `sdk.earn.eth` for EarnETH or `sdk.earn.usd` for EarnUSD. All methods on this
page use the public client and require no wallet signature. See [setup and supported
routes](./usage.md) before using the examples. Examples assume `earn`,
`publicClient`, and an `account` address from your application.

## Read at a specific block

`EarnReadOptions` contains an optional `blockNumber: bigint`. Positional read
methods accept it as the final argument; object-based methods include it in props.
Without it, reads use the client's default block selection. Pin the block when
combining multiple reads into one consistent view:

```ts
const blockNumber = await publicClient.getBlockNumber();
const [snapshot, position] = await Promise.all([
  earn.usd.collect(account, { blockNumber }),
  earn.usd.getPosition(account, { blockNumber }),
]);
```

Historical reads require an RPC provider that retains the requested state.

## Deployment and capabilities

### `getDeployment()`

Returns a copy of the selected `EarnDeployment`: `chainId`, `vault`, `collector`,
`shareManager`, `baseAsset`, `valuationToken`, `tokens`, `depositQueues`, and
`redeemQueues`. Each token entry contains its address and decimals. Each queue
contains `address`, `token`, `kind` (`sync` or `async`), and optional `legacy`.

### `getCapabilities()`

Returns copies of `depositQueues` and `redeemQueues` from the deployment. Both
methods inspect configuration, not current liquidity, paused state, or user
eligibility; use `collect()` for the queues' live `isPausedQueue` flags.

```ts
const deployment = earn.usd.getDeployment();
const capabilities = earn.usd.getCapabilities();
const activeQueues = capabilities.depositQueues.filter(
  (queue) => !queue.legacy,
);
```

## Collector snapshot

### `collect(account?, options?)`

Calls `Collector.collect(account, vault, config)` and returns its decoded struct
without normalization. `account` defaults to `zeroAddress`, which is useful for
vault-level data; pass a user address for that user's position and requests.

| Fields                                                 | Contents                                                      |
| ------------------------------------------------------ | ------------------------------------------------------------- |
| `vault`, `baseAsset`                                   | Vault and base-asset addresses                                |
| `assets`, `assetDecimals`, `assetPrices`               | Parallel arrays describing assets                             |
| `queues`                                               | Queue addresses, asset addresses, flags, and raw queue values |
| `totalLP`, `limitLP`, `accountLP`                      | Share-denominated values                                      |
| `totalBase`, `limitBase`, `accountBase`, `lpPriceBase` | Base-asset valuation fields                                   |
| `totalUSD`, `limitUSD`, `accountUSD`, `lpPriceUSD`     | USD valuation fields                                          |
| `deposits`, `withdrawals`                              | Raw Collector request arrays                                  |
| `blockNumber`, `timestamp`                             | Snapshot block and timestamp                                  |

```ts
import { formatUnits } from 'viem';
import { EARN_USD_DECIMALS } from '@lidofinance/lido-ethereum-sdk/earn';

const snapshot = await earn.usd.collect(account);
console.log(formatUnits(snapshot.totalUSD, EARN_USD_DECIMALS));
console.log(snapshot.queues, snapshot.deposits);
```

Keep raw values as bigint. `EARN_USD_DECIMALS` is 8 for Collector USD valuation;
USDC-denominated preview fields are distinct from these snapshot USD fields.
The SDK does not interpret each queue's raw `values` array.

## Balance and position

### `balance(account, options?)`

Reads `ShareManager.balanceOf(account)` and returns `bigint` shares. This is not a
balance of the underlying deposit token.

### `getPosition(account, options?)`

Reads the share balance and calls `Collector.getWithdrawalParams` using the
configured valuation token's async queue. Returns:

| Field                          | Meaning                                           |
| ------------------------------ | ------------------------------------------------- |
| `shares`                       | Account's share balance                           |
| `assets`                       | Estimated underlying value                        |
| `token`, `address`, `decimals` | Valuation token identifier, address, and decimals |
| `shareManager`                 | ShareManager address                              |

EarnUSD uses USDC for position valuation, even if the user intends to withdraw
USDT. If the async queue is paused, the sync queue for the same token is used
for valuation. `assets` is `0n` when both are paused or the oracle report is
invalid. This valuation is not a guarantee of immediately available liquidity.

```ts
const position = await earn.usd.getPosition(account);
console.log(formatUnits(position.assets, position.decimals), position.token);
```

## Fees

### `getFees(options?)`

Resolves `feeManager()` on the vault and reads `protocolFeeD6` and
`performanceFeeD6`. Returns those two raw values and the `feeManager` address.
The contract returns `uint24`, so the fees are JavaScript `number`s, not bigints.
D6 uses a scale of 1,000,000: `5000` represents a fraction of 0.005, or 0.5%.

```ts
const fees = await earn.eth.getFees();
console.log(fees.protocolFeeD6, fees.performanceFeeD6);
```

## Deposit preview

### `previewDeposit(props)`

| Argument      | Type                         | Notes                                                |
| ------------- | ---------------------------- | ---------------------------------------------------- |
| `token`       | Vault-specific deposit token | Lowercase identifiers from the route table           |
| `assets`      | `bigint`                     | Input token units; zero allowed; must fit uint224    |
| `account`     | `Address`                    | Required; zero address allowed for a generic preview |
| `blockNumber` | `bigint`                     | Optional                                             |

Calls `Collector.getDepositParams`. For stETH, first converts to wstETH and selects
the active wstETH queue. Returns Collector fields `isDepositPossible`,
`isDepositorWhitelisted`, `isMerkleProofRequired`, `asset`, `shares`, `sharesUSDC`,
`assets`, `assetsUSDC`, and `eta`, plus:

- `queue`, `route`: selected queue address and kind.
- `token`, `assetDecimals`: effective deposit token and decimals.
- `inputAssets`: original amount before any stETH conversion.

```ts
const preview = await earn.usd.previewDeposit({
  token: 'usdc',
  assets: 1_000_000n,
  account,
});
console.log(
  preview.shares,
  preview.isDepositPossible,
  preview.isMerkleProofRequired,
);
```

The SDK does not obtain Merkle proofs or submit a deposit as part of previewing.

### `convertStethToWsteth(assets, options?)`

EarnETH-only helper calling wstETH's `getWstETHByStETH`. Accepts a nonnegative
uint256 amount of stETH and returns estimated wstETH units. It does not wrap tokens.
The conversion may change before a later transaction executes.

## Deposit allowance

### `getDepositAllowance(props)`

| Argument      | Type                               | Notes                                         |
| ------------- | ---------------------------------- | --------------------------------------------- |
| `token`       | Vault-specific ERC20 deposit token | Not `eth` (no allowance) or `steth` (wrap it) |
| `account`     | `Address`                          | Token owner; nonzero                          |
| `assets`      | `bigint`                           | Amount to deposit; zero allowed; fits uint224 |
| `blockNumber` | `bigint`                           | Optional                                      |

Reads the token's `allowance(account, spender)`, where the spender is the active
deposit queue used by `depositToQueue`. Returns:

| Field           | Meaning                                                                 |
| --------------- | ----------------------------------------------------------------------- |
| `token`         | Token identifier                                                        |
| `spender`       | Active deposit queue address                                            |
| `allowance`     | Current allowance                                                       |
| `isSufficient`  | `allowance >= assets`; no approval is needed                            |
| `requiresReset` | USDT only: allowance is nonzero but insufficient, so approve `0n` first |

```ts
const allowance = await earn.usd.getDepositAllowance({
  token: 'usdt',
  account,
  assets: 1_000_000n,
});
if (allowance.requiresReset) {
  // prepareDepositApproval({ token: 'usdt', assets: 0n }), confirm, then approve.
}
```

The result reflects the read block only; an allowance can change before the
deposit executes. See [Deposit approval](./transactions.md#deposit-approval).

## Withdrawal preview and availability

### `previewWithdraw(props)`

Arguments: `token`, `shares: bigint`, optional `mode: 'sync' | 'async'` (default
`async`), and optional `blockNumber`. Zero shares are allowed for a preview.
An unsupported route throws instead of switching routes.

Returns Collector fields `isWithdrawalPossible`, `asset`, `shares`, `sharesUSDC`,
`assets`, `assetsUSDC`, and `eta`, plus `queue`, `route`, `token`, and
`assetDecimals`. This method calculates output; it does not perform the same
liquidity and daily-limit checks as `getWithdrawAvailability`.

`isWithdrawalPossible` only means the Vault has not paused the queue
(`Vault.isPausedQueue`). When it is `false`, `assets`, `assetsUSDC`, and `eta`
are zero and `redeem` reverts. When it is `true`, `assets` is still zero if the
oracle report is suspicious or missing. The sync route's `penaltyD6`, maximum
report age, daily limit, and liquidity are not reflected here.

### `getWithdrawAvailability(props)`

Arguments: `token`, positive uint256 `shares`, and optional `blockNumber`.
Checks, in order: that the sync queue is not paused (Collector
`isWithdrawalPossible`), the remaining daily limit against the requested shares,
that the Collector-estimated output is non-zero, and finally that output against
the queue's liquid assets. Liquidity is read only if the earlier checks pass.

| `status`      | Other fields                                                 |
| ------------- | ------------------------------------------------------------ |
| `available`   | `queue`, `assets`, `remainingDailyLimit`, `liquidAssets`     |
| `unavailable` | `reason`: see below                                          |
| `unknown`     | `error`: the failure encountered while checking availability |

| `reason`        | Meaning                                                                        |
| --------------- | ------------------------------------------------------------------------------ |
| `no-sync-queue` | The token has no sync redeem queue                                             |
| `paused`        | The Vault paused the sync queue                                                |
| `daily-limit`   | Requested shares exceed the remaining daily limit                              |
| `zero-output`   | Collector estimated zero output (suspicious or missing oracle report, or dust) |
| `liquidity`     | Estimated output exceeds the queue's liquid assets                             |

```ts
const availability = await earn.usd.getWithdrawAvailability({
  token: 'usdc',
  shares: 10n ** 18n,
});
if (availability.status === 'available') {
  console.log(availability.assets, availability.remainingDailyLimit);
} else if (availability.status === 'unavailable') {
  console.log(availability.reason);
} else {
  console.error(availability.error);
}
```

Daily limits use shares; liquidity uses payout-token units. Invalid input still
throws. An `available` result is not a reservation of liquidity.

## Deposit requests

### `getDepositRequests(account, options?)`

Uses `collect` and normalizes deposits for configured queues. Returns
`EarnDepositRequest[]`; entries for unrecognized queues are omitted.

Each entry includes `chainId`, `vault`, `queue`, `asset`, `token`, `account`,
`timestamp`, `assets`, `claimableShares`, `eta`, and `isClaimable`.
`isClaimable` is derived from Collector `eta === 0n`.

### `getDepositQueueRequest(props)`

Arguments: `queue: Address`, `account: Address`, optional `blockNumber`. The queue
must be a configured async deposit queue, including a legacy queue.

Reads `requestOf(account)` and `claimableOf(account)` directly from the queue;
returns `queue`, `token`, `timestamp`, `assets`, and `claimableShares`.

```ts
const requests = await earn.eth.getDepositRequests(account);
for (const request of requests) {
  console.log(request.queue, request.assets, request.isClaimable);
}
```

Do not identify requests by token alone: active and legacy queues may share an asset.

## Withdrawal requests and pagination

### `getWithdrawalRequests(props)`

Reads `requestsOf` from the selected async redeem queue.

| Argument      | Type                            | Default           |
| ------------- | ------------------------------- | ----------------- |
| `token`       | Vault-specific withdrawal token | Required          |
| `account`     | `Address`                       | Required          |
| `offset`      | `bigint`                        | `0n`; nonnegative |
| `limit`       | `bigint`                        | `100n`; positive  |
| `blockNumber` | `bigint`                        | Optional          |

Returns `EarnWithdrawalRequest[]`: `timestamp`, `shares`, `assets`, `isClaimable`,
and the same chain/vault/queue/asset/token/account identity fields as deposits.

### `getAllWithdrawalRequests(props)`

Accepts `token`, `account`, optional positive `pageSize` (default `100n`), and
optional `blockNumber`. Reads successive pages until one is shorter than the page
size. If no block is supplied, captures the latest block once for all pages.

```ts
const requests = await earn.usd.getAllWithdrawalRequests({
  token: 'usdt',
  account,
  pageSize: 100n,
});
const timestamps = requests
  .filter((request) => request.isClaimable)
  .map((request) => request.timestamp);
```

Timestamps identify requests only within their queue. Pass them to
[`claimWithdrawals`](./transactions.md#claims-and-cancellations) for the same token,
account, and vault. Fetching all pages does not submit claims.

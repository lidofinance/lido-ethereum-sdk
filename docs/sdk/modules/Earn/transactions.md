---
sidebar_position: 3
---

# Earn transactions

Each Earn send method executes one contract call through the SDK transaction
lifecycle. Your application coordinates approvals, wrapping, deposits, and claims.
See [setup](./usage.md) and [read methods](./reads.md) for the values used below.
Examples assume `earn`, `account`, and any amounts or queue addresses are provided
by your application.

## Common arguments and results

Send methods accept `EarnTransactionProps`:

| Argument                              | Type                                        | Purpose                                                       |
| ------------------------------------- | ------------------------------------------- | ------------------------------------------------------------- |
| `account`                             | `Address` or viem `Account`                 | Optional explicit account; otherwise resolved from the wallet |
| `callback`                            | `TransactionCallback`                       | Optional SDK transaction-stage callback                       |
| `onStep`                              | `(step: EarnStep) => void \| Promise<void>` | Optional operation metadata callback before execution         |
| `waitForTransactionReceiptParameters` | viem receipt-wait options                   | Optional receipt waiting configuration                        |

Sending requires a wallet client on the same chain as the SDK core.
Each send returns `TransactionResult<EarnDecodedResult>`:

- `hash`: submitted transaction or multisig proposal hash.
- `receipt`: present when execution was confirmed through the SDK flow.
- `confirmations`: confirmation count when available.
- `result`: decoded result when available. Sync deposits may include
  `receivedShares`, summed from matching `Deposited` events. Other Earn operations
  currently return an empty decoded object; async deposits do not report minted shares.

A result containing only a hash is not proof of contract execution. Do not send a
dependent operation until the preceding one has a successful receipt.

## Deposit approval

### `prepareDepositApproval({ token, assets })`

Returns an `EarnTransaction` for ERC20 `approve`. `assets` must fit uint224; zero
produces an `approval-reset` step. The spender is the active deposit queue for the
token. Native ETH (no allowance) and stETH are rejected: approve stETH for wrapping
through the [wrap module](../wrap.md).

```ts
const approval = await earn.usd.prepareDepositApproval({
  token: 'usdc',
  assets: 1_000_000n,
});
const result = await approval.send({ account });
console.log(result.hash);
```

Use [`getDepositAllowance`](./reads.md#deposit-allowance) to decide whether to
approve. When it reports `requiresReset` (USDT with an insufficient nonzero
allowance), send and confirm a zero-amount approval first. Neither the check nor
the reset happens automatically inside `depositToQueue`.

## Deposit

### `depositToQueue(props)`

| Argument          | Type                         | Default / constraint                        |
| ----------------- | ---------------------------- | ------------------------------------------- |
| `token`           | Vault-specific deposit token | Required; not stETH (wrap it first)         |
| `assets`          | `bigint`                     | Positive input-token amount fitting uint224 |
| `referralAddress` | `Address`                    | Zero address                                |
| `merkleProof`     | `readonly Hex[]`             | Empty array; each entry must be bytes32     |

Also accepts the common transaction arguments. Chooses an active queue from the
deployment; never chooses a legacy deposit queue. ETH sends `assets` as native
`value`; ERC20 deposits send zero native value and require sufficient allowance.

```ts
const result = await earn.eth.depositToQueue({
  token: 'eth',
  assets: 10n ** 16n,
  account,
});
console.log(result.hash, result.result?.receivedShares);
```

A confirmed sync deposit mints shares in that transaction. An async deposit enters
the deposit queue; use the request reads and `claimDepositShares` later. Proofs
come from the application. The contract call has no min-output or deadline field.

## Withdrawal

### `withdraw(props)`

Arguments: payout `token`, positive uint256 `shares`, optional `mode`, and common
transaction arguments. Shares are vault shares, not an underlying asset amount.

| Mode             | Behavior                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------ |
| `auto` (default) | Selects sync when the availability check succeeds; otherwise async, including RPC failures |
| `sync`           | Requires an available sync route; throws when unavailable or unknown                       |
| `async`          | Selects the async queue without probing sync availability                                  |

```ts
const result = await earn.usd.withdraw({
  token: 'usdt',
  shares: 10n ** 18n,
  mode: 'async',
  account,
});
```

Sync redemption pays out in the transaction. Async redemption creates a request
that must later be claimed. USDT has no sync route. A failed sync transaction is
never retried automatically as async.

To show the selected route and later send that exact call, prepare once:

```ts
const tx = await earn.eth.prepareWithdraw({
  token: 'wsteth',
  shares,
  mode: 'auto',
  account,
});
console.log(tx.step.route);
await tx.send({ account });
```

Preparation fixes the selected route; sending does not reselect it if liquidity
changes. Previewing independently does not bind a later transaction to that preview.

## Claims and cancellations

| Method                 | Arguments beyond common props                   | Contract call                                             |
| ---------------------- | ----------------------------------------------- | --------------------------------------------------------- |
| `cancelDepositRequest` | `queue: Address`                                | Configured async deposit queue's `cancelDepositRequest()` |
| `claimDepositShares`   | None                                            | Vault's `claimShares(account)`                            |
| `claimWithdrawals`     | Payout `token`, `timestamps: readonly bigint[]` | Async redeem queue's `claim(account, timestamps)`         |

Cancellation accepts legacy queues too; whether the request can still be cancelled
is determined by the contract. Deposit-share claims operate on the vault, not a
caller-selected deposit queue.

Withdrawal claims require a nonempty list of uint32 timestamps and remove duplicate
timestamps within that list. Use requests from the same account and payout queue:

```ts
const requests = await earn.usd.getAllWithdrawalRequests({
  token: 'usdt',
  account,
});
const timestamps = requests
  .filter((request) => request.isClaimable)
  .map((request) => request.timestamp);
if (timestamps.length > 0) {
  await earn.usd.claimWithdrawals({ token: 'usdt', timestamps, account });
}
```

For large lists, choose bounded groups that fit gas and RPC limits. Claims across
USDC and USDT queues are separate operations, coordinated by the application.

## Populate, estimate, and simulate

The following families expose all four methods:

| Send                   | Populate                         | Estimate gas                      | Simulate                         |
| ---------------------- | -------------------------------- | --------------------------------- | -------------------------------- |
| `depositToQueue`       | `depositToQueuePopulateTx`       | `depositToQueueEstimateGas`       | `depositToQueueSimulateTx`       |
| `withdraw`             | `withdrawPopulateTx`             | `withdrawEstimateGas`             | `withdrawSimulateTx`             |
| `cancelDepositRequest` | `cancelDepositRequestPopulateTx` | `cancelDepositRequestEstimateGas` | `cancelDepositRequestSimulateTx` |
| `claimDepositShares`   | `claimDepositSharesPopulateTx`   | `claimDepositSharesEstimateGas`   | `claimDepositSharesSimulateTx`   |
| `claimWithdrawals`     | `claimWithdrawalsPopulateTx`     | `claimWithdrawalsEstimateGas`     | `claimWithdrawalsSimulateTx`     |

Each helper accepts the operation's props. Population returns `{ to, from, data,
value }` without estimating gas or sending. Gas estimation returns a bigint
unchanged from RPC. Simulation uses `eth_call` and returns `{ request, result }`;
`result` is raw return data, not decoded receipt events.

```ts
const props = { token: 'eth', assets: 10n ** 16n, account } as const;
const call = await earn.eth.depositToQueuePopulateTx(props);
const gas = await earn.eth.depositToQueueEstimateGas(props);
const simulation = await earn.eth.depositToQueueSimulateTx(props);
```

A successful simulation is not a guarantee of future execution. Sending does not
first call `simulate`. Allowance and balances must already suffice to simulate or
estimate dependent calls in isolation.

## Prepared transactions

`prepareDepositToQueue`, `prepareWithdraw`, `prepareCancelDepositRequest`,
`prepareClaimDepositShares`, `prepareClaimWithdrawals`, and `prepareDepositApproval`
return an `EarnTransaction`.

| Member                          | Purpose                                                                  |
| ------------------------------- | ------------------------------------------------------------------------ |
| `step`                          | Operation kind and, where applicable, token, queue, and route            |
| `populate(props?)`              | Encoded call and sender for external signing                             |
| `estimateGas(props?, options?)` | RPC gas estimate; optional SDK transaction options                       |
| `simulate(props?)`              | Dry run and raw return data                                              |
| `send(props?)`                  | Execute one call through the SDK                                         |
| `bindAccount(address)`          | Return a new instance bound to that address; reject rebinding to another |

Deposits, withdrawals, and claims are bound to the account resolved at preparation.
Approval and cancellation can be explicitly bound with `bindAccount`. A bound
address does not supply signing credentials or override a different wallet account.
Prepare a new transaction when changing accounts.

For batches and account abstraction, obtain individual populated calls and pass
them to your wallet integration in dependency order. The SDK does not submit a
batch or UserOperation and does not guarantee batch atomicity.

## Callbacks

```ts
import { TransactionCallbackStage } from '@lidofinance/lido-ethereum-sdk';
import type { TransactionCallback } from '@lidofinance/lido-ethereum-sdk';

const callback: TransactionCallback = (event) => {
  switch (event.stage) {
    case TransactionCallbackStage.SIGN:
      console.log('Waiting for signature', event.payload);
      break;
    case TransactionCallbackStage.RECEIPT:
      console.log('Submitted hash', event.payload);
      break;
    case TransactionCallbackStage.CONFIRMATION:
      console.log('Receipt', event.payload);
      break;
    case TransactionCallbackStage.ERROR:
      console.error(event.payload);
      break;
  }
};
await earn.eth.depositToQueue({ token: 'eth', assets, account, callback });
```

| Stage           | Payload / meaning                                                    |
| --------------- | -------------------------------------------------------------------- |
| `GAS_LIMIT`     | Gas estimation is starting (EOA only)                                |
| `SIGN`          | Proposed gas limit; returning bigint overrides it                    |
| `RECEIPT`       | Submitted transaction hash; waiting for inclusion                    |
| `CONFIRMATION`  | Receipt; Earn rejects reverted receipts before forwarding this stage |
| `DONE`          | Confirmation count after successful execution                        |
| `MULTISIG_DONE` | Proposal submitted, without confirmed contract execution             |
| `ERROR`         | `EarnExecutionError` for a failure inside the send flow              |

For contract accounts (for example, Safe), the SDK skips gas estimation and
`GAS_LIMIT`, passes a placeholder gas value at `SIGN`, and ends at `MULTISIG_DONE`
without `RECEIPT`, `CONFIRMATION` or `DONE`.

`onStep` runs before the transaction flow and receives operation metadata. There
is no multi-step execution engine behind this callback. Application-specific gas
rounding can be applied by returning a bigint at `SIGN`.

## Errors and recovery

```ts
import { EarnExecutionError } from '@lidofinance/lido-ethereum-sdk/earn';

try {
  await earn.usd.claimWithdrawals({ token: 'usdt', timestamps, account });
} catch (error) {
  if (error instanceof EarnExecutionError) {
    console.error(error.failedStep, error.submittedHash, error.cause);
  }
  throw error;
}
```

`EarnExecutionError` wraps failures inside the send flow. It has
`code: 'TRANSACTION_ERROR'`, `failedStep`, optional `submittedHash`, and `cause`.
Input validation, preparation, account resolution, and chain checks can throw
before that wrapper and before an `ERROR` callback. Read and simulation failures
may propagate directly from viem. Always catch the method's rejected promise.

Inspect a submitted hash before retrying after a timeout or callback failure:
the transaction may already have executed. Track previously confirmed operations
in the application; no rollback or automatic resumption is performed.

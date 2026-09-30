---
sidebar_position: 1
sidebar_label: Overview and usage
---

# EarnETH and EarnUSD

The `earn` module integrates the Mellow contracts used by Lido EarnETH and
EarnUSD.

Import it separately or use `sdk.earn` on `LidoSDK`.

```ts
import { createPublicClient, createWalletClient, custom, http } from 'viem';
import { mainnet } from 'viem/chains';
import { LidoSDKEarn } from '@lidofinance/lido-ethereum-sdk/earn';

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(rpcUrl),
});
const walletClient = createWalletClient({
  chain: mainnet,
  transport: custom(walletProvider),
});
const earn = new LidoSDKEarn({ publicClient, walletClient });
// Or: new LidoSDKEarn({ core: existingCore });
```

With `LidoSDK`, the module is available as `sdk.earn` with the default mainnet
deployments. Custom deployments or Collector settings require a separate
`LidoSDKEarn` instance (see [custom deployments](#custom-deployments-and-application-responsibilities)):

```ts
import { LidoSDK } from '@lidofinance/lido-ethereum-sdk';

const sdk = new LidoSDK({
  chainId: 1,
  rpcProvider: publicClient,
  web3Provider: walletClient,
});
await sdk.earn.eth.collect();
```

`rpcUrl` and `walletProvider` belong to your application. Omit `walletClient` for
read-only use; provide an explicit `account` to prepare calls without a wallet.
Constructing the module does not access the network or require Earn deployments
on the selected chain. Calling Earn on an unsupported chain throws `NOT_SUPPORTED`.

## Supported routes

| Vault   | Deposit                                      | Withdrawal                            |
| ------- | -------------------------------------------- | ------------------------------------- |
| EarnETH | ETH, WETH, wstETH, GG, strETH, DVstETH: sync | wstETH: sync or async                 |
| EarnETH | stETH: wrap to wstETH, then sync deposit     |                                       |
| EarnUSD | USDC, USDT: sync; USDe: async                | USDC: sync or async; USDT: async only |

Mainnet presets include the old async deposit queues for reading, cancelling
pending deposits, and claiming shares. New deposits never select a legacy queue.
`getDeployment()` exposes queue addresses and route kinds; `getCapabilities()`
returns just the deposit and redeem queue lists.
Configuration and ABIs originate from staking-widget commit `7f192b30`.

Amounts are `bigint` in the token's smallest units. `shares` and `assets` are
separate quantities. USDC/USDT use 6 decimals, USDe uses 18; Collector USD values
use 8 (`EARN_USD_DECIMALS`). FeeManager values are returned as raw D6 integers.
No floating-point money conversion occurs in the SDK.

## Reads and previews

```ts
const snapshot = await earn.eth.collect(); // no wallet, zero account
const position = await earn.usd.getPosition(account);
const fees = await earn.eth.getFees();
const preview = await earn.usd.previewDeposit({
  account,
  token: 'usdt',
  assets: 1_000_000n,
});
const withdrawal = await earn.usd.previewWithdraw({
  token: 'usdt',
  shares: 10n ** 18n,
});
```

`collect(account?, { blockNumber? })` returns the complete Collector response,
including queues, pending requests, valuation fields, block number and timestamp.
`balance`, `getPosition`, and `getFees` also accept a block number.
USD position valuation always uses the USDC async queue; choosing USDT for a
withdrawal does not change the position's valuation basis.

`previewDeposit` retains the Collector's eligibility, whitelist, proof and ETA
fields. For stETH it converts the input before previewing the wstETH deposit.
`previewWithdraw` accepts explicit `sync` or `async` mode (default: async).

Previews are estimates, not quotes guaranteed at execution. The current deposit
and redeem signatures do not expose min-output or deadline parameters. Merkle
proofs are caller-supplied; the SDK does not fetch proofs or resolve ENS names.
Referral defaults to the zero address, not the widget's referral configuration.

## Deposits

Each method sends one contract transaction. The application coordinates
approval, wrapping, and deposit as separate operations. `getDepositAllowance`
reports which approvals are needed; nothing is approved or reset automatically.

```ts
import type { EarnTransaction } from '@lidofinance/lido-ethereum-sdk/earn';

const assets = 1_000_000n;
const allowance = await earn.usd.getDepositAllowance({
  token: 'usdt',
  account,
  assets,
});

const confirm = async (tx: EarnTransaction) => {
  const result = await tx.send({ account, callback });
  if (result.receipt?.status !== 'success') {
    // A multisig returns only a proposal hash. Persist it and resume after
    // confirming execution externally.
    throw new Error('Approval execution must be confirmed before depositing');
  }
};

if (allowance.requiresReset) {
  // USDT reverts when changing one nonzero allowance to another.
  await confirm(
    await earn.usd.prepareDepositApproval({ token: 'usdt', assets: 0n }),
  );
}
if (!allowance.isSufficient) {
  await confirm(
    await earn.usd.prepareDepositApproval({ token: 'usdt', assets }),
  );
}

const result = await earn.usd.depositToQueue({
  token: 'usdt',
  assets,
  account,
  referralAddress,
  merkleProof: [],
  callback,
});
```

The spender is always the active deposit queue for the token (`allowance.spender`).
Native ETH requires no approval and carries the deposited amount in `value`.

### Depositing stETH

`depositToQueue`, `prepareDepositApproval` and `getDepositAllowance` do not accept
stETH (it is excluded from their token types and rejected at runtime). Wrap it with
the [wrap module](../wrap.md) first, then deposit the wstETH that the wrap minted:

```ts
const wrapAllowance = await sdk.wrap.getStethForWrapAllowance(account);
if (wrapAllowance < stethAmount) {
  await sdk.wrap.approveStethForWrap({ value: stethAmount, account, callback });
}
const wrapped = await sdk.wrap.wrapSteth({
  value: stethAmount,
  account,
  callback,
});
const assets = wrapped.result?.wstethReceived;
if (!assets) throw new Error('Wrap must be confirmed before depositing');

// Check and approve the wstETH allowance as above, then:
await sdk.earn.eth.depositToQueue({
  token: 'wsteth',
  assets,
  account,
  callback,
});
```

Deposit exactly `wrapped.result.wstethReceived`, the wstETH amount minted by
that wrap. Do not use these amounts instead:

- **A `convertStethToWsteth` estimate.** The stETH/wstETH rate changes with each
  rebase, so the wrap can mint slightly less than an earlier estimate. Depositing
  the estimate can then revert or take wstETH the account already held.
- **The account's whole wstETH balance.** It may include wstETH the user did not
  intend to deposit.

To show the expected result before wrapping, call `previewDeposit` with
`token: 'steth'`: it converts the amount to wstETH and previews that deposit.

`depositToQueue` has `PopulateTx`, `EstimateGas`, and `SimulateTx` variants:

```ts
const call = await earn.eth.depositToQueuePopulateTx({
  token: 'eth',
  assets,
  account,
});
const gas = await earn.eth.depositToQueueEstimateGas({
  token: 'eth',
  assets,
  account,
});
const simulation = await earn.eth.depositToQueueSimulateTx({
  token: 'eth',
  assets,
  account,
});
```

For individual approvals, `prepareDepositApproval` returns a transaction with
`populate`, `estimateGas`, `simulate`, and `send` methods.

All sends use `core.performTransaction`, with the existing transaction callbacks,
receipt waiting options, and multisig handling. Earn checks reverted receipts
before forwarding confirmation or success, even when no callback is provided.
Earn gas estimates are returned unchanged from the RPC provider. Application-specific
rounding or additional gas margins should be applied by the consuming project.

## Account abstraction and external signing

```ts
const approval = await earn.usd.prepareDepositApproval({
  token: 'usdc',
  assets,
});
const calls = [
  await approval.populate({ account }),
  await earn.usd.depositToQueuePopulateTx({ token: 'usdc', assets, account }),
];
// Adapt these calls to your wallet or AA client's format and submit in this order.
```

The application selects and orders calls, including any USDT allowance reset
reported by `getDepositAllowance`. Each prepared transaction exposes `step`, `populate()`, `estimateGas()`,
`simulate()` and `send()`. Population performs no gas estimation: dependent calls
may fail estimation in isolation until approval or wrapping has executed.
Simulation errors are propagated.

The SDK does not submit batches or UserOperations. The wallet or smart account
implementation determines whether a batch is atomic. For stETH batches, the
application must account for changes in the wrap conversion before execution.

Prepared deposits, withdrawals and claims bind the account used when preparing
the operation; passing a different account is rejected. Approvals and
cancellations are not bound (their calldata contains no account). Prepare a new
call after changing accounts.

## Withdrawals

```ts
const availability = await earn.eth.getWithdrawAvailability({
  token: 'wsteth',
  shares,
});
const tx = await earn.eth.prepareWithdraw({ token: 'wsteth', shares, account });
showSelectedRoute(tx.step.route);
await tx.send({ account, callback });
```

`withdraw` and `prepareWithdraw` accept a `mode`:

- `auto` (default): use sync when available, otherwise async, including when the
  availability RPC fails. This preserves the widget's behavior.
- `sync`: fail if instant withdrawal is unavailable or unknown.
- `async`: use the async queue without probing sync availability.

`getWithdrawAvailability` distinguishes available, unavailable (no queue, paused
queue, daily limit, zero output, liquidity) and unknown (RPC failure). `auto`
falls back to async when the sync queue is paused. It does not check whether the
async queue is paused (use `previewWithdraw({ mode: 'async' })` and read
`isWithdrawalPossible`). Daily limits are measured in shares;
liquidity is measured in the payout asset. Availability can change before signing.
An already-sent or failed sync withdrawal is never automatically resubmitted via
async. Recheck availability and ask the user to choose another operation.

`withdraw`, `cancelDepositRequest`, `claimDepositShares`, and `claimWithdrawals`
each have `PopulateTx`, `EstimateGas`, and `SimulateTx` variants. Prepare once and
use the returned transaction when simulation and send must use the same call.

## Requests, legacy deposits and claims

```ts
const deposits = await earn.eth.getDepositRequests(account);
const legacyState = await earn.eth.getDepositQueueRequest({ queue, account });
await earn.eth.cancelDepositRequest({ queue, account });
await earn.eth.claimDepositShares({ account });

const page = await earn.usd.getWithdrawalRequests({
  token: 'usdt',
  account,
  offset: 0n,
  limit: 100n,
});
const all = await earn.usd.getAllWithdrawalRequests({ token: 'usdt', account });
await earn.usd.claimWithdrawals({ token: 'usdt', account, timestamps });
```

Deposit requests retain queue identity, including multiple queues for the same
asset. `claimDepositShares` calls `vault.claimShares(account)`; cancellation calls
the specified known async queue. The contract determines whether cancellation is
still possible.

Withdrawal timestamps are unique only within a queue. Returned requests include
chain, vault, queue, asset and account. Claims validate timestamps as uint32 and
deduplicate within the selected queue. `getAllWithdrawalRequests` pins all pages
to one block so queue changes cannot shift pagination mid-read.

To claim across several payout queues, the application reads each queue's
requests and calls `claimWithdrawals` separately with its claimable timestamps.
Large claim lists may exceed gas/RPC limits; submit bounded timestamp groups.

## Transaction results, multisig and errors

Each send returns the SDK's `TransactionResult` for one transaction. A multisig
submission may return only a hash; it does not mean funds moved. Confirm that
proposal before sending a dependent operation.

`EarnExecutionError` preserves `failedStep`, `submittedHash` when known, and the
original error as `cause`. On a timeout inspect the submitted hash before retrying.
The application tracks completed operations and decides how to resume after a
failure. `onStep` identifies the operation before its transaction callbacks begin.

## Custom deployments and application responsibilities

Pass explicit per-vault `deployment`/`collectorConfig` options through
`new LidoSDKEarn({ core, vaults: { eth: { deployment } } })` for private forks or
verified deployments. The chain ID must match the core. Configuration is not
fetched from a mutable remote manifest. Overrides are trusted input; verify the
vault, token, queue, Collector and ShareManager associations before using them.

The default Collector configuration is exported as `EARN_COLLECTOR_CONFIG`:

| Field                    | Default                                      |
| ------------------------ | -------------------------------------------- |
| `baseAssetFallback`      | `0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE` |
| `oracleUpdateInterval`   | `86400n` seconds                             |
| `redeemHandlingInterval` | `3600n` seconds                              |

These values are passed to Collector reads; they do not configure an application
polling interval. An override may be partial: omitted fields keep their defaults.

```ts
import { LidoSDKEarn } from '@lidofinance/lido-ethereum-sdk/earn';

const customEarn = new LidoSDKEarn({
  core: existingCore,
  vaults: {
    eth: {
      deployment: verifiedDeployment,
      collectorConfig: { redeemHandlingInterval: 7200n },
    },
  },
});
```

Contract ABIs are exported with an `EARN_` prefix (`EARN_VAULT_ABI`,
`EARN_COLLECTOR_ABI`, `EARN_SYNC_DEPOSIT_QUEUE_ABI`, …) for applications that
read additional contract state directly.

UI feature flags, geographic restrictions, address screening, analytics, wallet
connection, cache invalidation, APY HTTP requests and user-facing error messages
remain application responsibilities.

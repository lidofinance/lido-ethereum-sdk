---
sidebar_position: 3
---

# Get rewards accrued with the latest stETH token rebase for the chosen account

## Requirements

- RPC provider

[Implementation example](https://github.com/lidofinance/lido-ethereum-sdk/blob/main/examples/rewards/src/lastEvent.ts)

For the convenience of calculating user balances, it is proposed to use [`Shares`](https://docs.lido.fi/guides/lido-tokens-integration-guide#steth-internals-share-mechanics).

This case can be used to calculate rewards without having to subscribe to a Rebase event.
The first thing you need to do is get the latest `TokenRebased` event to receive information about the token rebase. As soon as the event is received, it is necessary to calculate the change in the user’s balance. To do this you need to use the following formula:

```ts
(balanceInShares * totalEther) / totalShares;
```

Next, you need to calculate the user’s balance in stETH before the event (if unknown) and calculate the user’s balance in stETH after the event. The difference between these values will be the user’s reward for the rebase.

Simplified code example:

```ts
// Get the last Rebase event
const lastRebaseEvent = await sdk.events.stethEvents.getLastRebaseEvent();
// Event arguments
const { preTotalShares, preTotalEther, postTotalShares, postTotalEther } =
  lastRebaseEvent?.args;

// User's balance in shares before the event
const balanceInShares = await lidoSDK.shares.balance(address); // for example, the value can be taken from the database
// Calculation of the user's balance in stETH before the event
const preBalanceStETH = (balanceInShares * preTotalEther) / preTotalShares;
// Calculation of the user's balance in stETH after the event
const postBalanceStETH = (balanceInShares * postTotalEther) / postTotalShares;

// Calculate user's balance change per Rebase event
const rewardsInStETH = postBalanceStETH - preBalanceStETH;
```

---
sidebar_position: 2
---

# Subscribe on the stETH token rebase events to track rewards updates

## Requirements

- RPC provider

[Implementation example](https://github.com/lidofinance/lido-ethereum-sdk/blob/main/examples/rewards/src/subscribeToEvent.ts)

For the convenience of calculating user balances, it is proposed to use [`Shares`](https://docs.lido.fi/guides/lido-tokens-integration-guide#steth-internals-share-mechanics)

The first thing you need to do is subscribe to the `TokenRebased` event to receive information about the token rebase. As soon as the event is received, it is necessary to calculate the change in the user’s balance. To do this you need to use the following formula:

```ts
(balanceInShares * totalEther) / totalShares;
```

Next, you need to calculate the user’s balance in stETH before the event (if unknown) and calculate the user’s balance in stETH after the event. The difference between these values will be the user’s rewards for the rebase.

Docs: [Shares](/methods/shares)
Simplified code example:

```ts
// User's balance in shares before the event
const balanceInShares = await lidoSDK.shares.balance(address);

// Signature for the rebase event
rpcProvider.watchContractEvent({
  address: stethContract.address,
  abi: stethContract.abi,
  eventName: 'TokenRebased',
  onLogs: calculateRewards,
});

// Reward calculation function
async function calculateRewards(logs) {
  // Received event
  const lastRebaseEvent = logs[logs.length - 1];
  // Event arguments
  const { preTotalShares, preTotalEther, postTotalShares, postTotalEther } =
    lastRebaseEvent?.args;

  // Calculation of the user's balance in stETH before the event
  const preBalanceStETH = (balanceInShares * preTotalEther) / preTotalShares;
  // Calculation of the user's balance in stETH after the event
  const postBalanceStETH = (balanceInShares * postTotalEther) / postTotalShares;

  // Calculate user's balance change per Rebase event
  const rewardsInStETH = postBalanceStETH - preBalanceStETH;
}
```

---
sidebar_position: 6
---

# Keep track of rewards accrued for the set of accounts

## By subscribing to the `TokenRebased` event

### Requirements

- RPC provider

[Implementation example](https://github.com/lidofinance/lido-ethereum-sdk/blob/main/examples/rewards/src/usersRewardsBySubscribeEvent.ts)

For the convenience of calculating users’ balances, it is proposed to use [`Shares`](https://docs.lido.fi/guides/lido-tokens-integration-guide#steth-internals-share-mechanics)

The first thing you need to do is subscribe to the `TokenRebased` event to receive information about the token rebase. As soon as the event is received, it is necessary to calculate the change in the users` balances. To do this you need to use the following formula:

```ts
(balanceInShares * totalEther) / totalShares;
```

Next, you need to calculate the users’ balances in stETH before the event (if unknown) and calculate the users’ balances in stETH after the event. The difference between these values will be the users’ rewards for the rebase.

To keep track of rewards accrued for the set of addresses, you need to:

- Subscribe to the `TokenRebased` event
- Calculate the user’s balance in stETH before the event (if unknown)
- Calculate the user’s balance in stETH after the event
- Calculate the user’s updated balance per Rebase event

Simplified code example:

```ts
// Users' balances in shares before the event
const balanceInShares = [balance_1, balance_2, balance_3];

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

  const balancesUpdate = balanceInShares.map((balance) => {
    // Calculation of the user's balance in stETH before the event
    const preBalanceStETH = (balance * preTotalEther) / preTotalShares;
    // Calculation of the user's balance in stETH after the event
    const postBalanceStETH = (balance * postTotalEther) / postTotalShares;

    // Calculate user's balance change per Rebase event
    return postBalanceStETH - preBalanceStETH;
  });
}
```

## By last `TokenRebased` event

### Requirements

- RPC provider

[Implementation example](https://github.com/lidofinance/lido-ethereum-sdk/blob/main/examples/rewards/src/usersRewardsByLastEvent.ts)

To keep track of rewards accrued for the set of addresses by last event, you need to:

- Get the last Rebase event
- Calculate the user’s balance in stETH before the event (if unknown)
- Calculate the user’s balance in stETH after the event
- Calculate the user’s updated balance per Rebase event

Simplified code example:

```ts
// Users' balances in shares before the event
const balanceInShares = [balance_1, balance_2, balance_3];

// Get the last Rebase event
const lastRebaseEvent = await sdk.events.stethEvents.getLastRebaseEvent();

// Event arguments
const { preTotalShares, preTotalEther, postTotalShares, postTotalEther } =
  lastRebaseEvent?.args;

const balancesUpdate = balanceInShares.map((balance) => {
  // Calculation of the user's balance in stETH before the event
  const preBalanceStETH = (balance * preTotalEther) / preTotalShares;
  // Calculation of the user's balance in stETH after the event
  const postBalanceStETH = (balance * postTotalEther) / postTotalShares;

  // Calculate user's balance change per Rebase event
  return postBalanceStETH - preBalanceStETH;
});
```

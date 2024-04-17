# Step by step guide to calculate rewards for Rebase event

Although user-friendly, stETH rebases add a whole level of complexity to integrating stETH into other dApps and protocols.
Therefore, SDK has prepared several options for obtaining information about user rewards. This can be convenient when, for some reason, it is not possible to recalculate user balances through the mechanism of the stETH token itself

## Subscribe Rebase event

[Implementation example](./src/sabscribeEvent.ts)

For the convenience of calculating user balances, it is proposed to use [`Shares`](https://docs.lido.fi/guides/lido-tokens-integration-guide#steth-internals-share-mechanics)

The first thing you need to do is subscribe to the `TokenRebased` event to receive information about the token rebase. As soon as the event is received, it is necessary to calculate the change in the user’s balance. To do this you need to use the following formula:

```ts
(balanceInShares * totalEther) / totalShares;
```

Next, you need to calculate the user’s balance in stETH before the event (if unknown) and calculate the user’s balance in stETH after the event. The difference between these values will be the user’s rewards for the rebase.

Docs: [Shares](../../packages/sdk/README.md#shares)
Simplified code example:

```ts
// User's balance in shares before the event
const oldBalanceInShares = await lidoSDK.shares.balance(address);

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
  const oldBalanceStETH = (oldBalanceInShares * preTotalEther) / preTotalShares;
  // Calculation of the user's balance in stETH after the event
  const newBalanceStETH =
    (oldBalanceInShares * postTotalEther) / postTotalShares;

  // Calculate the user's reward for Rebase Event
  const rewardsInStETH = newBalanceStETH - oldBalanceStETH;
}
```

## Last Rebase event

[Implementation example](./src/lastEvent.ts)

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

// User's balance in balls before the event
const oldBalanceInShares = await lidoSDK.shares.balance(address); // for example, the value can be taken from the database
// Calculation of the user's balance in stETH before the event
const oldBalanceStETH = (oldBalanceInShares * preTotalEther) / preTotalShares;
// Calculation of the user's balance in stETH after the event
const newBalanceStETH = (oldBalanceInShares * postTotalEther) / postTotalShares;

// Calculate the user's reward for rebasing
const rewardsInStETH = newBalanceStETH - oldBalanceStETH;
```

## Calculating rewards from on-chain without calculating using the formula

[Implementation example](./src/rewardsOnChain.ts)

Information about the user’s rewards can be calculating from on-chain using SDK without the need to calculate using a formula.
To do this, you need to use the `getRewardsFromChain` method ([Docs](../../packages/sdk/README.md#rewards))
The method allows you to request rewards for a certain period of time (days, seconds, blocks)

Simplified code example:

```ts
const rewardsQuery = await lidoSDK.rewards.getRewardsFromChain({
  address: rewardsAddress,
  stepBlock: 10000, // defaults to 50000, max block range per 1 query
  back: {
    days: 1n,
  },
});
```

## Calculating information about rewards from off-chain without calculating using the formula

[Implementation example](./src/rewardsSubgraph.ts)

Information about the user’s rewards can be obtained from off-chain using SDK without the need for calculation using a formula.
To do this, you need to use the `getRewardsFromSubgraph` method [[Docs](../../packages/sdk/README.md#rewards)]. You will also need a key to access `The Graph`. ([Docs](https://docs.lido.fi/integrations/subgraph/))

Simplified code example:

```ts
const rewardsQuery = await lidoSDK.rewards.getRewardsFromSubgraph({
  address: rewardsAddress,
  blocksBack: 10000,
  stepEntities: 500, // defaults to 1000, max entities per one request to endpoint
  getSubgraphUrl(graphId, chainId) {
    return `https://gateway.thegraph.com/api/${apiKey}/subgraphs/id/${id}`;
  },
});
```

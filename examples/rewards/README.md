# Case study: stETH rewards accounting with SDK

## Introduction

stETH is a [rebaseable ERC-20 token](https://docs.lido.fi/guides/lido-tokens-integration-guide/#what-is-steth) that represents ether staked with Lido.

The integration of stETH into decentralized applications (dApps), protocols, CEXes, and custodian services, have additional requirements and considerations due to its rebasing mechanism.

While stETH is designed to have the best UX for users (e.g., representing their staked ether amount at the moment with the balance), incorporating it into various platforms requires careful consideration of the reward attribution approaches.

## Approach

The SDK offers several methods for retrieving reward information.

This is particularly useful in scenarios where recalculating user balances directly through the stETH token mechanism is not feasible.

## Accounting model

The proposed approach involves maintaining an accounting model based on stETH [shares](https://docs.lido.fi/guides/lido-tokens-integration-guide#bookkeeping-shares) rather than stETH balances. This model relies on tracking the individual account balance in shares. The same accounting model of shares is applicable for collective accounts (used for CEXes and custodian services), allowing participants to join and leave with precise share amounts, thus ensuring accurate reward attribution.

## Implementation notes

Token shares are managed at the contract level, with dedicated methods for handling share-related operations. Detailed documentation on these methods can be found in the [shares-related methods](https://docs.lido.fi/contracts/lido/#shares-related-methods) section.
You can also use [SDK methods](../../packages/sdk/README.md#shares) to work with users’ shares directly.

## Usage

For developers looking to integrate stETH rewards management into their applications, the Lido Ethereum SDK offers comprehensive interfaces and methods for shares and rewards estimation. Detailed examples and usage guidelines are provided in the [Lido Ethereum SDK documentation](../../packages/sdk/README.md).

By adopting this approach and leveraging the capabilities of the SDK, developers can effectively manage stETH rewards within their applications, ensuring a seamless user experience despite the complexities of the underlying rebasing mechanism.

---

> **_NOTE:_** Due to possibility of rounding errors on shares -> stETH conversion, events-based approach described below is intended for display purposes mostly, bookkeeping should be based on the stETH token shares. See also [1](https://docs.lido.fi/guides/lido-tokens-integration-guide/#1-2-wei-corner-case), [2](https://github.com/lidofinance/lido-dao/issues/442).

The [Lido Ethereum SDK](../../packages/sdk/README.md) has the full set of features in this regard:

- [estimating APR](../../packages/sdk/README.md#getlastapr) for the latest token rebase.
- [calculating average APR](../../packages/sdk/README.md#getsmaapr) over a selected period.
- [last rebase event](../../packages/sdk/README.md#getlastrebaseevent) (contains share rate)
- [first rebase event](../../packages/sdk/README.md#getfirstrebaseevent) starting from the reference point in the past
- [get last N](../../packages/sdk/README.md#getlastrebaseevents) rebase events
- [get all rebase events](../../packages/sdk/README.md#getrebaseevents) for the last N days
- assessing specific rewards accrued over a chosen period by an address
  - [On-chain](../../packages/sdk/README.md#get-rewards-from-chain)
  - [Subgraph](../../packages/sdk/README.md#get-rewards-from-subgraph)
- work with [user balances](../../packages/sdk/README.md#shares) based on stETH shares

## Code Examples

### Subscribe on the stETH token rebase events to track rewards updates

#### Requirements

- RPC provider

[Implementation example](./src/subscribeToEvent.ts)

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

### Get rewards accrued with the latest stETH token rebase for the chosen account

#### Requirements

- RPC provider

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

// User's balance in shares before the event
const balanceInShares = await lidoSDK.shares.balance(address); // for example, the value can be taken from the database
// Calculation of the user's balance in stETH before the event
const preBalanceStETH = (balanceInShares * preTotalEther) / preTotalShares;
// Calculation of the user's balance in stETH after the event
const postBalanceStETH = (balanceInShares * postTotalEther) / postTotalShares;

// Calculate user's balance change per Rebase event
const rewardsInStETH = postBalanceStETH - preBalanceStETH;
```

### Retrieve reward history for the chosen account using the event logs (recommended)

#### Requirements

- RPC provider (full node)

[Implementation example](./src/rewardsOnChain.ts)

Information about the user’s rewards can be calculating from on-chain using SDK without the need to calculate using a formula.
To do this, you need to use the `getRewardsFromChain` method ([Docs](../../packages/sdk/README.md#rewards))
The method allows you to request rewards for a certain period of time (days, seconds, blocks)

Simplified code example:

```ts
const rewardsQuery = await lidoSDK.rewards.getRewardsFromChain({
  address: rewardsAddress,
  stepBlock: 10000, // max blocks in 1 query - depend on the RPC capabilities and pricing plans
  back: {
    days: 1n, // 1 day back from the current block
    // blocks: 10000n, // 10000 blocks back from the current block
    // seconds: 86400n, // 86400 seconds back from the current block
  },
  // from: {
  //   timestamp: 0n, // from timestamp
  //   block: 0n, // from block number
  // }
  // to: {
  //   timestamp: 0n, // to timestamp
  //   block: 0n, // to block number
  // }
});
```

### Retrieve reward history for the chosen account using the Subgraph indexer (alternative way)

#### Requirements

- The Graph API key

> **_NOTE:_** The subgraph deployed on The Graph Decentralized Network. The subgraph data is indexed and served by independent indexers on the network. Therefore, the performance of the subgraph may depend on the indexer selected at the time of the request.
> Also, due to distributed indexers, the data in the subgraph may lag slightly behind the data in the on-chain network.

[Implementation example](./src/rewardsSubgraph.ts)

Information about the user’s rewards can be obtained from off-chain using SDK without the need for calculation using a formula.
To do this, you need to use the `getRewardsFromSubgraph` method [[Docs](../../packages/sdk/README.md#rewards)]. You will also need a key to access `The Graph`. ([Docs](https://docs.lido.fi/integrations/subgraph/))

Simplified code example:

```ts
const rewardsQuery = await lidoSDK.rewards.getRewardsFromSubgraph({
  address: rewardsAddress,
  back: {
    days: 1n, // 1 day back from the current block
    // blocks: 10000n, // 10000 blocks back from the current block
    // seconds: 86400n, // 86400 seconds back from the current block
  },
  // from: {
  //   timestamp: 0n, // from timestamp
  //   block: 0n, // from block number
  // }
  // to: {
  //   timestamp: 0n, // to timestamp
  //   block: 0n, // to block number
  // }
  stepEntities: 500, // defaults to 1000, max entities per one request to endpoint
  getSubgraphUrl(graphId, chainId) {
    return `https://gateway.thegraph.com/api/${apiKey}/subgraphs/id/${id}`;
  },
});
```

### Calculate the effective APR for the chosen account concerning the given period

#### On-chain

[Implementation example](./src/averageAPRbyOnChain.ts)

##### Requirements

- RPC provider (full node)

To calculate the effective APR for the address concerning the given period, you need:

- Calculate user's rewards for the period
- Sum APR for each rebase event
- Calculate the average APR for the period

Simplified code example:

```ts
const rewardsQuery = await lidoSDK.rewards.getRewardsFromChain({
  address: mockAddress,
  stepBlock: 10000, // max blocks in 1 query - depend on the RPC capabilities and pricing plans
  back: {
    days: 1n,
  },
  includeOnlyRebases: true,
});
const totalAPR = rewardsQuery.rewards.reduce(
  (acc: number, reward: any) => acc + reward.apr,
  0,
);

return totalAPR / rewards.length;
```

#### Subgraph

##### Requirements

- The Graph API key

> **_NOTE:_** The subgraph deployed on The Graph Decentralized Network. The subgraph data is indexed and served by independent indexers on the network. Therefore, the performance of the subgraph may depend on the indexer selected at the time of the request.
> Also, due to distributed indexers, the data in the subgraph may lag slightly behind the data in the on-chain network.

[Implementation example](./src/averageAPRbySubgraph.ts)

To calculate the effective APR for the address concerning the given period, you need:

- Calculate user's rewards for the period
- Sum APR for each rebase event
- Calculate the average APR for the period

Simplified code example:

```ts
const rewardsQuery = await lidoSDK.rewards.getRewardsFromSubgraph({
  address: rewardsAddress,
  blocksBack: 10000,
  stepEntities: 500, // defaults to 1000, max entities per one request to endpoint
  includeOnlyRebases: true,
  getSubgraphUrl(graphId, chainId) {
    return `https://gateway.thegraph.com/api/${apiKey}/subgraphs/id/${id}`;
  },
});
const totalAPR = rewardsQuery.rewards.reduce(
  (acc: number, reward: any) => acc + reward.apr,
  0,
);

return totalAPR / rewards.length;
```

### Keep track of rewards accrued for the set of accounts

#### By subscribing to the `TokenRebased` event

#### Requirements

- RPC provider

[Implementation example](./src/usersRewardsBySubscribeEvent.ts)

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

#### By last `TokenRebased` event

#### Requirements

- RPC provider

[Implementation example](./src/usersRewardsByLastEvent.ts)

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

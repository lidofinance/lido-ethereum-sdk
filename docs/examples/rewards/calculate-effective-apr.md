---
sidebar_position: 6
---

# Calculate the effective APR for the chosen account concerning the given period

## On-chain

[Implementation example](https://github.com/lidofinance/lido-ethereum-sdk/blob/main/examples/rewards/src/averageAPRbyOnChain.ts)

### Requirements

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

## Subgraph

### Requirements

- The Graph API key

> **_NOTE:_** The subgraph deployed on The Graph Decentralized Network. The subgraph data is indexed and served by independent indexers on the network. Therefore, the performance of the subgraph may depend on the indexer selected at the time of the request.
> Also, due to distributed indexers, the data in the subgraph may lag slightly behind the data in the on-chain network.

[Implementation example](https://github.com/lidofinance/lido-ethereum-sdk/blob/main/examples/rewards/src/averageAPRbySubgraph.ts)

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

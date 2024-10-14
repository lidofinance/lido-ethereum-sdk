---
sidebar_position: 5
---

# Retrieve reward history for the chosen account using the Subgraph indexer (alternative way)

## Requirements

- The Graph API key

> **_NOTE:_** The subgraph deployed on The Graph Decentralized Network. The subgraph data is indexed and served by independent indexers on the network. Therefore, the performance of the subgraph may depend on the indexer selected at the time of the request.
> Also, due to distributed indexers, the data in the subgraph may lag slightly behind the data in the on-chain network.

[Implementation example](https://github.com/lidofinance/lido-ethereum-sdk/blob/main/examples/rewards/src/rewardsSubgraph.ts)

Information about the user’s rewards can be obtained from off-chain using SDK without the need for calculation using a formula.
To do this, you need to use the `getRewardsFromSubgraph` method [[Docs](/modules/rewards)]. You will also need a key to access `The Graph`. ([Docs](https://docs.lido.fi/integrations/subgraph/))

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

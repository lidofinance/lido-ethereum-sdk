---
sidebar_position: 13
---

# Rewards

This module allows you to query historical rewards data for given address via chain events or subgraph.
y

## Common Options

- **address** - (Type: Address) address of an account you want to query rewards for
- **to** (Type: [`blockType`](/methods/lido-events#getrebaseevents)) defaults to `{block: "latest"}`, upper bound for query

- **from** (Type: [`blockType`](/methods/lido-events#getrebaseevents)) lower bound for query
  or
- **back** (Type: [`backType`](/methods/lido-events#getrebaseevents)) alternative way to define lower bound relative to `to`

- **includeZeroRebases** [default: `false` ] - include rebase events when users had no rewards(because of empty balance)
- **includeOnlyRewards** [default: `false` ] - include only rebase events

## Common Return

```Typescript
type RewardsResult = {
  // pre query states
  baseBalance: bigint;
  baseBalanceShares: bigint;
  baseShareRate: number;
  // commutative rewards in stETH
  totalRewards: bigint;
  // computed block numbers
  fromBlock: bigint;
  toBlock: bigint;
  // query result in block/logIndex ascending order
  rewards: {
    type: 'submit' | 'withdrawal' | 'rebase' | 'transfer_in' | 'transfer_out';
    change: bigint; // negative or positive change in stETH
    changeShares: bigint; // same in shares
    balance: bigint; // post event balance in stETH
    balanceShares: bigint; // same in shares
    shareRate: number; // apx share rate at a time of event
    apr?: number; // apr for rebase events
    originalEvent: RewardsChainEvents | RewardsSubgraphEvents ; // original event from chain/subgraph, contains extra info
  }[]
};
```

## Get Rewards from chain

This method heavily utilizes RPC fetching chain event logs. It's better suited for smaller,recent queries. Beware that this might cause rate limit issues on free RPC endpoints.

```ts
const lidoSDK = new LidoSDK({
  chainId: 5,
  rpcUrls: ['https://eth-goerli.alchemyapi.io/v2/{ALCHEMY_API_KEY}'],
});

const rewardsQuery = await lidoSDK.rewards.getRewardsFromChain({
  address: rewardsAddress,
  stepBlock: 10000, // defaults to 50000, max block range per 1 query
  back: {
    days: 10n,
  },
});

console.log(rewardsQuery.rewards);
```

## Get Rewards from subgraph

This method requires you to provide API URL to send subgraph requests to. It's better suited for larger, more historical queries.

### Important notes

- **to** is capped by last indexed block in subgraph. Block number is available in result object by `lastIndexedBlock`.
- **getSubgraphUrl** can also return object of type `{url:string,requestHeaders?: Record<string,string> }` that is passed to `graphql-request` for extra configurability

```ts
const lidoSDK = new LidoSDK({
  chainId: 5,
  rpcUrls: ['https://eth-goerli.alchemyapi.io/v2/{ALCHEMY_API_KEY}'],
});

const rewardsQuery = await lidoSDK.rewards.getRewardsFromSubgraph({
  address: rewardsAddress,
  blocksBack: 10000,
  stepEntities: 500, // defaults to 1000,  max entities per one request to endpoint
  getSubgraphUrl(graphId, chainId) {
    return `https://gateway.thegraph.com/api/${apiKey}/subgraphs/id/${id}`;
  },
});

console.log(rewardsQuery.rewards);
```

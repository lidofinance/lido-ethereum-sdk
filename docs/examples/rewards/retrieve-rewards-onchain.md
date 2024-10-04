---
sidebar_position: 4
---

# Retrieve reward history for the chosen account using the event logs (recommended)

## Requirements

- RPC provider (full node)

[Implementation example](https://github.com/lidofinance/lido-ethereum-sdk/blob/main/examples/rewards/src/rewardsOnChain.ts)

Information about the user’s rewards can be calculating from on-chain using SDK without the need to calculate using a formula.
To do this, you need to use the `getRewardsFromChain` method ([Docs](/modules/rewards))
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

---
sidebar_position: 1
title: Introduction
---

SDK usage examples for various practical cases.

## stETH rewards accounting

The provided examples are useful to establish robust accounting for the stETH rebaseable token, learn more about [stETH rebases](https://docs.lido.fi/contracts/lido/#rebase). For some complicated scenarios of using collective accounts for multiples users (might be applicable for CEXes and custodian services), see the suggested [reward attribution](https://hackmd.io/@lido/rewards-attribution) approaches.

### Basic rebase tracking

- [Example 1. Subscribe on the stETH token rebase events to track rewards updates](rewards/subscribe-on-events)
- [Example 2. Get rewards accrued with the latest stETH token rebase for the chosen account](rewards/get-rewards.md)

### Reward history

- [Example 3. Retrieve reward history for the chosen account using the event logs (recommended)](rewards/retrieve-rewards-onchain.md)
- [Example 4. Retrieve reward history for the chosen account using the Subgraph indexer (alternative way)](rewards/retrieve-rewards-subgraph.md)
- [Example 5. Calculate the effective APR for the chosen account concerning the given period](rewards/calculate-effective-apr.md)
- [Example 6. Keep track of rewards accrued for the set of accounts](rewards/keep-track-rewards.md)

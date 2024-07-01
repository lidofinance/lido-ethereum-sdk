---
sidebar_position: 1
title: Introduction
---

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
You can also use [SDK methods](/methods/shares) to work with users’ shares directly.

## Usage

For developers looking to integrate stETH rewards management into their applications, the Lido Ethereum SDK offers comprehensive interfaces and methods for shares and rewards estimation. Detailed examples and usage guidelines are provided in the [Lido Ethereum SDK documentation](/).

By adopting this approach and leveraging the capabilities of the SDK, developers can effectively manage stETH rewards within their applications, ensuring a seamless user experience despite the complexities of the underlying rebasing mechanism.

---

> **_NOTE:_** Due to possibility of rounding errors on shares -> stETH conversion, events-based approach described below is intended for display purposes mostly, bookkeeping should be based on the stETH token shares. See also [1](https://docs.lido.fi/guides/lido-tokens-integration-guide/#1-2-wei-corner-case), [2](https://github.com/lidofinance/lido-dao/issues/442).

The [Lido Ethereum SDK](/) has the full set of features in this regard:

- [estimating APR](/methods/lido-statistics#getlastapr) for the latest token rebase.
- [calculating average APR](/methods/lido-statistics#getsmaapr) over a selected period.
- [last rebase event](/methods/lido-events#getlastrebaseevent) (contains share rate)
- [first rebase event](/methods/lido-events#getfirstrebaseevent) starting from the reference point in the past
- [get last N](/methods/lido-events#getlastrebaseevents) rebase events
- [get all rebase events](/methods/lido-events#getrebaseevents) for the last N days
- assessing specific rewards accrued over a chosen period by an address
  - [On-chain](/methods/rewards#get-rewards-from-chain)
  - [Subgraph](/methods/rewards#get-rewards-from-subgraph)
- work with [user balances](/methods/shares) based on stETH shares

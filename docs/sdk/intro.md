---
sidebar_position: 1
title: Introduction
slug: /
---

**Lido Ethereum SDK** is a package that provides convenient tools for interacting with Lido contracts on the Ethereum network through a software development kit (SDK). This SDK simplifies working with Lido contracts and accessing their functionality.

## Changelog

For changes between versions see [CHANGELOG.MD](https://github.com/lidofinance/lido-ethereum-sdk/blob/main/packages/sdk/CHANGELOG.md)

## Migration

## Installation

You can install the Lido Ethereum SDK using npm or yarn. `viem` is required as a peer dep:

```bash
// SDK (stakes, wrap, withdrawals)
yarn add viem @lidofinance/lido-ethereum-sdk
```

## Usage

To get started with the Lido Ethereum SDK, you need to import the necessary modules:

```ts
const { LidoSDK } = require('@lidofinance/lido-ethereum-sdk');

// Or, if you are using ES6+:
import { LidoSDK } from '@lidofinance/lido-ethereum-sdk';

// Or, import separate each module separately to save up on bundle size
import { LidoSDKStake } from '@lidofinance/lido-ethereum-sdk/stake';
```

✨ See also the [examples](/examples/intro) provided for some more real-life applications.

## Initialization

Before using the SDK, you need to create an instance of the LidoSDK class:

```ts
// Pass your own viem PublicClient

import { createPublicClient, http } from 'viem';
import { goerli } from 'viem/chains';

const rpcProvider = createPublicClient({
  chain: goerli,
  transport: http(),
});
const sdk = new LidoSDK({
  chainId: 5,
  rpcProvider,
  web3Provider: provider, // optional
});
```

```ts
// Or just rpc urls so it can be created under the hood
const sdk = new LidoSDK({
  chainId: 5,
  rpcUrls: ['https://eth-goerli.alchemyapi.io/v2/{ALCHEMY_API_KEY}'],
  web3Provider: provider, // optional
});
```

Replace "https://eth-goerli.alchemyapi.io/v2/{ALCHEMY_API_KEY}" with the address of your Ethereum provider.

## Example

Basic examples and usage instructions can be found in [here](/category/get-started).

```ts
const lidoSDK = new LidoSDK({
  chainId: 5,
  rpcUrls: ['https://eth-goerli.alchemyapi.io/v2/{ALCHEMY_API_KEY}'],
  web3Provider: provider,
});

// Views
const balanceETH = await lidoSDK.core.balanceETH(address);

// Calls
const stakeTx = await lidoSDK.stake.stakeEth({
  value,
  callback,
  referralAddress,
  account,
});

// relevant results are returned with transaction
const { stethReceived, sharesReceived } = stakeTx.result;

console.log(balanceETH.toString(), 'ETH balance');
```

## Migration

For breaking changes between versions see [MIGRATION.md](https://github.com/lidofinance/lido-ethereum-sdk/blob/main/packages/sdk/MIGRATION.md)

## Documentation

For additional information about available methods and functionality, refer to the [the documentation for the Lido Ethereum SDK](/category/modules).

## Playground

To check out SDK in action visit [playground](https://lidofinance.github.io/lido-ethereum-sdk/playground). Or tinker locally by cloning this repo and following [Playground instructions](https://github.com/lidofinance/lido-ethereum-sdk/blob/main/playground/README.md).

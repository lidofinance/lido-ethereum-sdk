![Lido SDK Logo](./assets/package_logo.png)

<div style="display: flex;" align="center">
  <h1 align="center">Lido Ethereum SDK</h1>
</div>

<div style="display: flex;" align="center">
   <a href="https://github.com/lidofinance/lido-ethereum-sdk/blob/main/LICENSE.txt"><img alt="GitHub license" src="https://img.shields.io/github/license/lidofinance/lido-ethereum-sdk?color=limegreen"></a>
   <a href="https://www.npmjs.com/package/@lidofinance/lido-ethereum-sdk"><img alt="Downloads npm" src="https://img.shields.io/npm/dm/@lidofinance/lido-ethereum-sdk?color=limegreen"></a>
   <a href="https://www.npmjs.com/package/@lidofinance/lido-ethereum-sdk"><img alt="Version npm" src="https://img.shields.io/npm/v/@lidofinance/lido-ethereum-sdk?label=version"></a>
   <a href="https://www.npmjs.com/package/@lidofinance/lido-ethereum-sdk"><img alt="npm bundle size" src="https://img.shields.io/bundlephobia/min/@lidofinance/lido-ethereum-sdk"></a>
   <a href="https://github.com/lidofinance/lido-ethereum-sdk"><img alt="GitHub top language" src="https://img.shields.io/github/languages/top/lidofinance/lido-ethereum-sdk"></a>
   <a href="https://github.com/lidofinance/lido-ethereum-sdk/pulls"><img alt="GitHub Pull Requests" src="https://img.shields.io/github/issues-pr/lidofinance/lido-ethereum-sdk"></a>
   <a href="https://github.com/lidofinance/lido-ethereum-sdk/issues"><img alt="GitHub open issues" src="https://img.shields.io/github/issues/lidofinance/lido-ethereum-sdk"></a>
</div>
<br/>

**Lido Ethereum SDK** is a package that provides convenient tools for interacting with Lido contracts on the Ethereum network through a software development kit (SDK). This SDK simplifies working with Lido contracts and accessing their functionality.

## Changelog

For changes between versions see [CHANGELOG.MD](packages/sdk/CHANGELOG.md)

## Migration

## Installation

You can install the Lido Ethereum SDK using npm or yarn:

[Docs SDK package](https://lidofinance.github.io/lido-ethereum-sdk/)

```bash
// SDK (stakes, wrap, withdrawals)
yarn add @lidofinance/lido-ethereum-sdk
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

✨ See also the [examples](./examples/README.md) provided for some more real-life applications.

## Initialization

Before using the SDK, you need to create an instance of the LidoSDK class:

```ts
// Pass your own viem PublicClient

import { createPublicClient, http } from 'viem';
import { holesky } from 'viem/chains';

const rpcProvider = createPublicClient({
  chain: holesky,
  transport: http(),
});

const sdk = new LidoSDK({
  chainId: 17000,
  rpcProvider,
  web3Provider: provider, // optional
});
```

```ts
// Or just rpc urls so it can be created under the hood
const sdk = new LidoSDK({
  chainId: 17000,
  rpcUrls: ['<RPC_URL>'],
  web3Provider: provider, // optional
});
```

Replace `<RPC_URL>` with the url of your Ethereum RPC provider.

## Examples

All examples and usage instructions can be found in the [Docs SDK package](https://lidofinance.github.io/lido-ethereum-sdk/).

```ts
const lidoSDK = new LidoSDK({
  chainId: 17000,
  rpcUrls: ['<RPC_URL>'],
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

For breaking changes between versions see [MIGRATION.md](packages/sdk/MIGRATION.md)

## Documentation

For additional information about available methods and functionality, refer to the [the documentation for the Lido Ethereum SDK](https://lidofinance.github.io/lido-ethereum-sdk/).

## Playground

To check out SDK in action visit [playground](https://lidofinance.github.io/lido-ethereum-sdk/playground). Or tinker locally by cloning this repo and following [Playground instructions](playground/README.md).

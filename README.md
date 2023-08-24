![Lido SDK Logo](./assets/package_logo.png)

# Lido Ethereum SDK

**Lido Ethereum SDK** is a package that provides convenient tools for interacting with Lido contracts on the Ethereum network through a software development kit (SDK). This SDK simplifies working with Lido contracts and accessing their functionality.

## Installation

You can install the Lido Ethereum SDK using npm or yarn:

[Docs SDK package](./packages/sdk/README.md)

```bash
// SDK (stakes, wrap, withdrawals)
yarn add @lidofinance/lido-ethereum-sdk
```

## Usage

To get started with the Lido Ethereum SDK, you need to import the necessary modules:

```ts
const { LidoSDK } = require("@lidofinance/lido-ethereum-sdk");

// Or, if you are using ES6+:
import { LidoSDK } from "@lidofinance/lido-ethereum-sdk";
```

## Initialization

Before using the SDK, you need to create an instance of the LidoSDK class:

```ts
// With own rpc provider
const sdk = new LidoSDK({
  chainId: 5,
  rpcProvider: ownRpcProvider,
  web3Provider: provider, // optional
});

// With RPC urls (without own rpc provider)
const sdk = new LidoSDK({
  chainId: 5,
  rpcUrls: ["https://eth-goerli.alchemyapi.io/v2/{ALCHEMY_API_KEY}"],
  web3Provider: provider, // optional
});
```

Replace "https://eth-goerli.alchemyapi.io/v2/{ALCHEMY_API_KEY}" with the address of your Ethereum provider.

## Examples

```ts
const lidoSDK = new LidoSDK({
  chainId: 5,
  rpcUrls: ["https://eth-goerli.alchemyapi.io/v2/{ALCHEMY_API_KEY}"],
});

// Views
const balanceETH = await lidoSDK.core.balanceETH(address);
const balanceStETH = await lidoSDK.staking.balanceStETH(address);

// Calls
const stakeResult = await lidoSDK.staking.stake({
  value,
  callback,
  referralAddress,
});

console.log(balanceETH.toString(), "ETH balance");
console.log(balanceStETH.toString(), "stETH balance");
console.log(stakeResult, "stake result");
```

## Documentation

For additional information about available methods and functionality, refer to the documentation for the Lido Ethereum SDK.[TODO: add link to documentation]

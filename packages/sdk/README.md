# Lido Ethereum SDK

**Lido Ethereum SDK** is a package that provides convenient tools for interacting with Lido contracts on the Ethereum network through a software development kit (SDK). This SDK simplifies working with Lido contracts and accessing their functionality.

## WIP

The project is currently under development and may change in the future.

## Installation

You can install the Lido Ethereum SDK using npm or yarn:

yarn:

```bash
yarn add @lidofinance/lido-ethereum-sdk
```

npm:

```bash
npm install @lidofinance/lido-ethereum-sdk
```

## Modules

The Lido Ethereum SDK consists of several modules:

- **Core** - provides access to the SDK core functionality
- **Staking** - provides access to the Lido staking functionality
  TODO: add more modules

## Usage

To get started with the Lido Ethereum SDK, you need to import the necessary modules:

```ts
const { LidoSDK } = require("@lidofinance/lido-ethereum-sdk");
// or
const { LidoSDKStaking } = require("@lidofinance/lido-ethereum-sdk/staking");
// or
const { LidoSDKCore } = require("@lidofinance/lido-ethereum-sdk/core");

// Or, if you are using ES6+:
import { LidoSDK } from "@lidofinance/lido-ethereum-sdk";
// or
import { LidoSDKStaking } from "@lidofinance/lido-ethereum-sdk/staking";
// or
import { LidoSDKCore } from "@lidofinance/lido-ethereum-sdk/core";
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
  rpcUrls: [
    "https://eth-goerli.alchemyapi.io/v2/{ALCHEMY_API_KEY}",
    "https://fallback-provider",
  ],
  web3Provider: provider, // optional
});
```

Replace "https://eth-goerli.alchemyapi.io/v2/{ALCHEMY_API_KEY}" with the address of your Ethereum provider.

## Examples

### Core

```ts
const lidoSDK = new LidoSDK({
  chainId: 5,
  rpcUrls: ["https://eth-goerli.alchemyapi.io/v2/{ALCHEMY_API_KEY}"],
});

// Views
const balanceETH = await lidoSDK.core.balanceETH(address);

console.log(balanceETH.toString(), "ETH balance");
```

### Staking

```ts
const lidoSDK = new LidoSDK({
  chainId: 5,
  rpcUrls: ["https://eth-goerli.alchemyapi.io/v2/{ALCHEMY_API_KEY}"],
});

// Views
const balanceStETH = await lidoSDK.staking.balanceStETH(address);

// Contracts
const addressStETH = lidoSDK.staking.contractAddressStETH();
const contractStETH = lidoSDK.staking.getContractStETH();

// Calls
const stakeResult = await lidoSDK.staking.stake({
  value,
  callback,
  referralAddress,
});

console.log(balanceStETH.toString(), "stETH balance");
console.log(addressStETH, "stETH contract address");
console.log(contractStETH, "stETH contract");
console.log(stakeResult, "stake result");
```

## Stake

### Call

Arguments:

- `value`: _string_ - amount of ETH to stake (in ETH)
- `callback`: _StageCallback_ - callback function that will be on each _stage_ of the transaction
- `referralAddress`: _string_ - referral address (optional)

Callback stages:

- `sign` - waiting for the user to sign the transaction
- `receipt` = waiting for the transaction to be included in the block
- `confirmation` - transaction is confirmed by the network
- `done` - transaction is successful
- `multisig_done` - transaction with multisig is successful
- `error` - transaction is failed

```ts
import {
  LidoSDK,
  StakeStageCallback,
  SDKError,
} from "@lidofinance/lido-ethereum-sdk";

const lidoSDK = new LidoSDK({
  rpcUrls: ["https://rpc-url"],
  chainId: 5,
});

// Define default web3 provider in sdk (window.ethereum) if web3Provider is not defined in constructor
lidoSDK.core.defineWeb3Provider(lidoSDK.core.chain);

const callback: StakeStageCallback = ({ stage, payload }) => {
  switch (stage) {
    case StakeCallbackStage.SIGN:
      console.log("wait for sign");
      break;
    case StakeCallbackStage.RECEIPT:
      console.log("wait for receipt");
      console.log(payload, "transaction hash");
      break;
    case StakeCallbackStage.CONFIRMATION:
      console.log("wait for confirmation");
      console.log(payload, "transaction receipt");
      break;
    case StakeCallbackStage.DONE:
      console.log("done");
      console.log(payload, "transaction confirmations");
      break;
    case StakeCallbackStage.ERROR:
      console.log("error");
      console.log(payload, "error object with code and message");
      break;
    default:
  }
};

try {
  const stakeResult = await lidoSDK.staking.stake({
    value,
    callback,
    referralAddress,
  });

  console.log(
    stakeResult,
    "transaction hash, transaction receipt, confirmations"
  );
} catch (error) {
  console.log((error as SDKError).errorMessage, (error as SDKError).code);
}
```

### Populate transaction

```ts
import { LidoSDK } from "@lidofinance/lido-ethereum-sdk";

const lidoSDK = new LidoSDK({
  rpcUrls: ["https://rpc-url"],
  chainId: 5,
});

const populateResult = lidoSDK.staking.stakePopulateTx({
  value,
  callback,
  referralAddress,
  account,
});

console.log(populateResult, "to, from, value, data");
```

### Simulate transaction

```ts
import { LidoSDK } from "@lidofinance/lido-ethereum-sdk";

const lidoSDK = new LidoSDK({
  rpcUrls: ["https://rpc-url"],
  chainId: 5,
});

const simulateResult = await lidoSDK.staking.stakeSimulateTx({
  value,
  callback,
  referralAddress,
  account,
});
```

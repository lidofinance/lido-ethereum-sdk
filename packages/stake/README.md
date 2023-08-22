# Lido Ethereum SDK Stake

**Lido Ethereum SDK Stake** is a package that provides convenient tools for interacting with Lido StETH contract on the Ethereum network through a software development kit (SDK). This SDK simplifies working with Lido contract and accessing its functionality.

## Installation

You can install the Lido Ethereum SDK using npm or yarn:

```bash
yarn add @lidofinance/lido-sdk-stake
```

## Usage

To get started with the Lido Ethereum SDK, you need to import the necessary modules:

```ts
const { LidoSDKStake } = require("@lidofinance/lido-sdk-stake");

// Or, if you are using ES6+:
import { LidoSDKStake } from "@lidofinance/lido-sdk";
```

## Initialization

Before using the SDK, you need to create an instance of the LidoSDKStake class:

```ts
// With own rpc provider
const sdk = new LidoSDKStake({
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

```ts
const lidoSDKStake = new LidoSDKStake({
  chainId: 5,
  rpcUrls: ["https://eth-goerli.alchemyapi.io/v2/{ALCHEMY_API_KEY}"],
});

// Views
const balanceETH = await lidoSDKStake.core.balanceETH(address);
const balanceStETH = await lidoSDKStake.balanceStETH(address);

// Contracts
const addressStETH = lidoSDKStake.contractAddressStETH();
const contractStETH = lidoSDKStake.getContractStETH();

// Calls
const stakeResult = await lidoSDKStake.stake({
  value,
  callback,
  referralAddress,
});

console.log(balanceETH.toString(), "ETH balance");
console.log(balanceStETH.toString(), "stETH balance");
console.log(addressStETH, "stETH contract address");
console.log(contractStETH, "stETH contract");
console.log(stakeResult, "stake result");
```

## Stake

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
  LidoSDKStake,
  StageCallback,
  SDKError,
} from "@lidofinance/lido-sdk-stake";

const lidoSDKStake = new LidoSDKStake({
  rpcUrls: ["https://rpc-url"],
  chainId: 5,
});

const callback: StageCallback = ({ stage, payload }) => {
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
  const stakeResult = await lidoSDKStake.stake({
    value,
    callback,
    referralAddress,
  });

  console.log(
    stakeResult,
    "transaction hash, transaction receipt, confirmations"
  );
} catch (error: SDKError) {
  console.log(error.errorMessage, error.code);
}
```

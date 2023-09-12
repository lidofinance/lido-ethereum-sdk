# Lido Ethereum SDK

**Lido Ethereum SDK** is a package that provides convenient tools for interacting with Lido contracts on the Ethereum network through a software development kit (SDK). This SDK simplifies working with Lido contracts and accessing their functionality.

## WIP

The project is currently under development and may change in the future.

## Table of contents

- [Installation](#installation)
- [Modules](#modules)
- [Usage](#usage)
- [Initialization](#initialization)
- [Examples](#examples)
  - [Core](#core)
  - [Staking](#staking)
- [Stake](#stake)
  - [Call](#call)
  - [Populate transaction](#populate-transaction)
  - [Simulate transaction](#simulate-transaction)
- [Withdrawal](#withdrawal)

  - [Call](#call-1)

    - [Send request withdrawal with Permit](#send-request-withdrawal-with-permit)
    - [Send request withdrawal with preallocated allowance](#send-request-withdrawal-with-preallocated-allowance)
    - [`Request` other methods](#request-other-methods)

  - [Utils](#utils)

    - [Set allowance of WithdrawalQueue contract](#set-allowance-of-withdrawalqueue-contract)
    - [`Allowance` other methods](#allowance-other-methods)

  - [Views](#views)

    - [Constants](#constants)
    - [Requests info](#requests-info)

- [Lido contract addresses](#lido-contract-addresses)

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
const { LidoSDK } = require('@lidofinance/lido-ethereum-sdk');
// or
const { LidoSDKStaking } = require('@lidofinance/lido-ethereum-sdk/staking');
// or
const { LidoSDKCore } = require('@lidofinance/lido-ethereum-sdk/core');

// Or, if you are using ES6+:
import { LidoSDK } from '@lidofinance/lido-ethereum-sdk';
// or
import { LidoSDKStaking } from '@lidofinance/lido-ethereum-sdk/staking';
// or
import { LidoSDKCore } from '@lidofinance/lido-ethereum-sdk/core';
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
    'https://eth-goerli.alchemyapi.io/v2/{ALCHEMY_API_KEY}',
    'https://fallback-provider',
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
  rpcUrls: ['https://eth-goerli.alchemyapi.io/v2/{ALCHEMY_API_KEY}'],
});

// Views
const balanceETH = await lidoSDK.core.balanceETH(address);

console.log(balanceETH.toString(), 'ETH balance');
```

### Staking

```ts
const lidoSDK = new LidoSDK({
  chainId: 5,
  rpcUrls: ['https://eth-goerli.alchemyapi.io/v2/{ALCHEMY_API_KEY}'],
});

// Views
const balanceStETH = await lidoSDK.staking.balanceStETH(address);

// Contracts
const addressStETH = await lidoSDK.staking.contractAddressStETH();
const contractStETH = await lidoSDK.staking.getContractStETH();

// Calls
const stakeResult = await lidoSDK.staking.stake({
  value,
  callback,
  referralAddress,
  account,
});

console.log(balanceStETH.toString(), 'stETH balance');
console.log(addressStETH, 'stETH contract address');
console.log(contractStETH, 'stETH contract');
console.log(stakeResult, 'stake result');
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
  TransactionCallbackStage,
  SDKError,
} from '@lidofinance/lido-ethereum-sdk';

const lidoSDK = new LidoSDK({
  rpcUrls: ['https://rpc-url'],
  chainId: 5,
});

// Define default web3 provider in sdk (window.ethereum) if web3Provider is not defined in constructor
lidoSDK.core.defineWeb3Provider();

const callback: StakeStageCallback = ({ stage, payload }) => {
  switch (stage) {
    case TransactionCallbackStage.SIGN:
      console.log('wait for sign');
      break;
    case TransactionCallbackStage.RECEIPT:
      console.log('wait for receipt');
      console.log(payload, 'transaction hash');
      break;
    case TransactionCallbackStage.CONFIRMATION:
      console.log('wait for confirmation');
      console.log(payload, 'transaction receipt');
      break;
    case TransactionCallbackStage.DONE:
      console.log('done');
      console.log(payload, 'transaction confirmations');
      break;
    case TransactionCallbackStage.ERROR:
      console.log('error');
      console.log(payload, 'error object with code and message');
      break;
    default:
  }
};

try {
  const stakeResult = await lidoSDK.staking.stake({
    value,
    callback,
    referralAddress,
    account,
  });

  console.log(
    stakeResult,
    'transaction hash, transaction receipt, confirmations',
  );
} catch (error) {
  console.log((error as SDKError).errorMessage, (error as SDKError).code);
}
```

### Populate transaction

```ts
import { LidoSDK } from '@lidofinance/lido-ethereum-sdk';

const lidoSDK = new LidoSDK({
  rpcUrls: ['https://rpc-url'],
  chainId: 5,
});

const populateResult = await lidoSDK.staking.stakePopulateTx({
  value,
  callback,
  referralAddress,
  account,
});

console.log(populateResult, 'to, from, value, data');
```

### Simulate transaction

```ts
import { LidoSDK } from '@lidofinance/lido-ethereum-sdk';

const lidoSDK = new LidoSDK({
  rpcUrls: ['https://rpc-url'],
  chainId: 5,
});

const simulateResult = await lidoSDK.staking.stakeSimulateTx({
  value,
  callback,
  referralAddress,
  account,
});
```

## Wrap

### Wrap ETH

Arguments:

- `value`: _string_ - amount of ETH to wrap to wstETH (staking ETH and then wrapping stETH to wstETH in a single tx)
- `callback`: _StageCallback_ - callback function that will be on each _stage_ of the transaction

```ts
import {
  LidoSDK,
  TransactionCallback,
  TransactionCallbackStage,
  SDKError,
} from '@lidofinance/lido-ethereum-sdk';

const lidoSDK = new LidoSDK({
  rpcUrls: ['https://rpc-url'],
  chainId: 5,
});

// Define default web3 provider in sdk (window.ethereum) if web3Provider is not defined in constructor
lidoSDK.core.defineWeb3Provider();

const callback: TransactionCallback = ({ stage, payload }) => {
  switch (stage) {
    case TransactionCallbackStage.SIGN:
      console.log('wait for sign');
      break;
    case TransactionCallbackStage.RECEIPT:
      console.log('wait for receipt');
      console.log(payload, 'transaction hash');
      break;
    case TransactionCallbackStage.CONFIRMATION:
      console.log('wait for confirmation');
      console.log(payload, 'transaction receipt');
      break;
    case TransactionCallbackStage.DONE:
      console.log('done');
      console.log(payload, 'transaction confirmations');
      break;
    case TransactionCallbackStage.ERROR:
      console.log('error');
      console.log(payload, 'error object with code and message');
      break;
    default:
  }
};

try {
  const wrapResult = await lidoSDK.staking.wrapETH({
    value,
    callback,
    account,
  });

  console.log(
    stakeResult,
    'transaction hash, transaction receipt, confirmations',
  );
} catch (error) {
  console.log((error as SDKError).errorMessage, (error as SDKError).code);
}
```

### Wrap stETH

To wrap stETH you first need to approve stETH to wrap contract:

```ts
import {
  LidoSDK,
  TransactionCallback,
  TransactionCallbackStage,
  SDKError,
} from '@lidofinance/lido-ethereum-sdk';

const lidoSDK = new LidoSDK({
  rpcUrls: ['https://rpc-url'],
  chainId: 5,
});

// get existing allowance
const allowance = await lidoSDK.wrap.getStethForWrapAllowance(account);

// if value is more than perform approve
const approveResult = await lidoSDK.wrap.approveStethForWrap({
  value,
  account,
  callback,
});

// wrap stETH
const wrapResult = await lidoSDK.wrap.wrapSteth({ value, account, callback });
```

### Unwrap

```ts
// unwrap wstETH to receive stETH
const unwrapResult = await lidoSDK.wrap.unwrap({
  value: unwrapAmount,
  account,
  callback,
});
```

### Utilities

For all transaction methods helper methods are available similar to `stake` module:

- `...populateTX`: returns ready to sign transaction object with all data encoded
- `...simulateTX`: performs dry-ran of the transaction to see if it will execute on the network

For `wrapEth` only `wrapEthEstimateGas` is available instead of `simulateTx` but you can use it all the same for checking transaction validity.

## Withdrawal

### Call

#### Send request withdrawal with Permit

`Supports EOA and Multisig`

```ts
import {
  LidoSDK,
  RequestStageCallback,
  RequestCallbackStages,
  SDKError,
} from '@lidofinance/lido-ethereum-sdk';

const lidoSDK = new LidoSDK({
  rpcUrls: ['https://rpc-url'],
  chainId: 5,
});

// Define default web3 provider in sdk (window.ethereum) if web3Provider is not defined in constructor
lidoSDK.core.defineWeb3Provider();

const callback: RequestStageCallback = ({ stage, payload }) => {
  switch (stage) {
    case RequestCallbackStages.PERMIT:
      console.log('wait for permit');
      break;
    case RequestCallbackStages.GAS_LIMIT:
      console.log('wait for gas limit');
      break;
    case RequestCallbackStages.SIGN:
      console.log('wait for sign');
      break;
    case RequestCallbackStages.RECEIPT:
      console.log('wait for receipt');
      console.log(payload, 'transaction hash');
      break;
    case RequestCallbackStages.CONFIRMATION:
      console.log('wait for confirmation');
      console.log(payload, 'transaction receipt');
      break;
    case RequestCallbackStages.DONE:
      console.log('done');
      console.log(payload, 'transaction confirmations');
      break;
    case RequestCallbackStages.MULTISIG_DONE:
      console.log('multisig_done');
      console.log(payload, 'transaction confirmations');
      break;
    case RequestCallbackStages.ERROR:
      console.log('error');
      console.log(payload, 'error object with code and message');
      break;
    default:
  }
};

try {
  const requestResult = await lidoSDK.withdrawals.request.requestByToken({
    amount,
    requests,
    token, // 'stETH' | 'wstETH'
    callback,
    account,
  });

  console.log(
    requestResult,
    'transaction hash, transaction receipt, confirmations',
  );
} catch (error) {
  console.log((error as SDKError).errorMessage, (error as SDKError).code);
}
```

#### Send request withdrawal with preallocated allowance

`Supports EOA and Multisig`

```ts
import {
  LidoSDK,
  RequestStageCallback,
  RequestCallbackStages,
  SDKError,
} from '@lidofinance/lido-ethereum-sdk';

const lidoSDK = new LidoSDK({
  rpcUrls: ['https://rpc-url'],
  chainId: 5,
});

// Define default web3 provider in sdk (window.ethereum) if web3Provider is not defined in constructor
lidoSDK.core.defineWeb3Provider();

const callback: RequestStageCallback = ({ stage, payload }) => {
  switch (stage) {
    case RequestCallbackStages.GAS_LIMIT:
      console.log('wait for gas limit');
      break;
    case RequestCallbackStages.SIGN:
      console.log('wait for sign');
      break;
    case RequestCallbackStages.RECEIPT:
      console.log('wait for receipt');
      console.log(payload, 'transaction hash');
      break;
    case RequestCallbackStages.CONFIRMATION:
      console.log('wait for confirmation');
      console.log(payload, 'transaction receipt');
      break;
    case RequestCallbackStages.DONE:
      console.log('done');
      console.log(payload, 'transaction confirmations');
      break;
    case RequestCallbackStages.ERROR:
      console.log('error');
      console.log(payload, 'error object with code and message');
      break;
    default:
  }
};

try {
  const requestResult = await lidoSDK.withdrawals.request.requestWithoutPermit({
    requests,
    token, // 'stETH' | 'wstETH'
    callback,
    account,
  });

  console.log(
    requestResult,
    'transaction hash, transaction receipt, confirmations',
  );
} catch (error) {
  console.log((error as SDKError).errorMessage, (error as SDKError).code);
}
```

#### `Request` other methods

##### EOA

- requestStethWithPermit
- requestWstethWithPermit
- requestStethWithoutPermit
- requestWstethWithoutPermit
- requestWithoutPermitByToken
- requestWithPermitByToken

##### Multisig

- requestStethMultisig
- requestWstethMultisig
- requestMultisigByToken

### Utils

#### Set allowance of WithdrawalQueue contract

`Supports EOA and Multisig`

```ts
import {
  LidoSDK,
  ApproveCallbackStages,
  ApproveStageCallback,
  SDKError,
} from '@lidofinance/lido-ethereum-sdk';

const lidoSDK = new LidoSDK({
  rpcUrls: ['https://rpc-url'],
  chainId: 5,
});

// Define default web3 provider in sdk (window.ethereum) if web3Provider is not defined in constructor
lidoSDK.core.defineWeb3Provider();

const callback: ApproveStageCallback = ({ stage, payload }) => {
  switch (stage) {
    case ApproveCallbackStages.GAS_LIMIT:
      console.log('wait for gas limit');
      break;
    case ApproveCallbackStages.SIGN:
      console.log('wait for sign');
      break;
    case ApproveCallbackStages.RECEIPT:
      console.log('wait for receipt');
      console.log(payload, 'transaction hash');
      break;
    case ApproveCallbackStages.CONFIRMATION:
      console.log('wait for confirmation');
      console.log(payload, 'transaction receipt');
      break;
    case ApproveCallbackStages.DONE:
      console.log('done');
      console.log(payload, 'transaction confirmations');
      break;
    case ApproveCallbackStages.ERROR:
      console.log('error');
      console.log(payload, 'error object with code and message');
      break;
    default:
  }
};

try {
  const approveResult = await lidoSDK.withdrawals.approval.approve({
    amount,
    token, // 'stETH' | 'wstETH'
    callback,
    account,
  });

  console.log(
    approveResult,
    'transaction hash, transaction receipt, confirmations',
  );
} catch (error) {
  console.log((error as SDKError).errorMessage, (error as SDKError).code);
}
```

#### `Allowance` other methods

##### EOA

- approveEOA
- approveSteth
- approveWsteth
- approveByToken

##### Multisig

- approveStethMultisig
- approveWstethMultisig
- approveMultisigByToken

##### Views

- getAllowanceByToken
- checkAllowanceByToken
- checkAllowanceSteth
- checkAllowanceWsteth

### Views

- getWithdrawalRequestsIds
- getLastCheckpointIndex
- getWithdrawalStatus
- findCheckpointHints
- getClaimableEther
- getUnfinalizedStETH

#### Constants

- minStethWithdrawalAmount
- maxStethWithdrawalAmount
- isPaused
- isBunkerModeActive
- isTurboModeActive

#### Requests info

###### `getWithdrawalRequestsInfo`

###### Input Parameters:

- `props: { account: Address }`
  - `account` (Type: Address): The account address.

##### Output Parameters:

- Type: Object
- Structure:

  - `claimableInfo` (Type: Object): Information about withdrawal requests that can be claimed.
    - `claimableRequests` (Type: Array[RequestStatusWithId]): A list of requests with their statuses and identifiers.
    - `claimableAmountStETH` (Type: bigint): The amount of ETH available for claiming.
  - `pendingInfo` (Type: Object): Information about pending withdrawal requests.
    - `pendingRequests` (Type: Array[RequestStatusWithId]): A list of requests with their statuses and identifiers.
    - `pendingAmountStETH` (Type: bigint): The amount of ETH pending for withdrawal.
  - `claimableETH` (Type: bigint): The amount of ETH available for claiming.

###### `getWithdrawalRequestsStatus`

###### Input Parameters:

- `props: { account: Address }`
  - `account` (Type: Address): The account address.

##### Output Parameters:

- Type: Array of RequestStatusWithId objects
- Structure of each object:

  - `id` (Type: bigint): The request identifier.
  - `isFinalized` (Type: boolean): A flag indicating whether the request has been finalized.
  - `isClaimed` (Type: boolean): A flag indicating whether the request has already been claimed.
  - `amountOfStETH` (Type: bigint): The amount of stETH to be withdrawn.
  - `amountOfShares` (Type: bigint): The amount of shares to be burned.
  - `owner` (Type: Address): The account address that initiated the request.
  - `timestamp` (Type: bigint): The timestamp of the request.
  - `stringId` (Type: string): The request identifier in string format.

###### `getClaimableRequestsInfo`

###### Input Parameters:

- `props: { account: Address }`
  - `account` (Type: Address): The account address.

###### Output Parameters:

- Type: Object
- Structure:

  - `claimableRequests` (Type: Array[RequestStatusWithId]): A list of requests that can be claimed.
  - `claimableAmountStETH` (Type: bigint): The amount of ETH available for claiming.

###### `getClaimableRequestsETHByIds`

###### Input Parameters:

- `props: { claimableRequestsIds: (bigint | RequestStatusWithId)[] }`
  - `claimableRequestsIds` (Type: Array): An array of request identifiers for which information is needed.

###### Output Parameters:

- Type: Object
- Structure:

  - `ethByRequests` (Type: Array of bigint): A list of ETH amounts for each request.
  - `ethSum` (Type: bigint): The sum of all ETH amounts in the list.
  - `hints` (Type: Array of bigint): A list of hints for each request.

###### `getClaimableRequestsETHByAccount`

###### Input Parameters:

- `props: { account: Address }`
  - `account` (Type: Address): The account address.

###### Output Parameters:

- Type: Object
- Structure:

  - `ethByRequests` (Type: Array of bigint): A list of ETH amounts for each request.
  - `ethSum` (Type: bigint): The sum of all ETH amounts in the list.
  - `hints` (Type: Array of bigint): A list of hints for each request.
  - `requests` (Type: Array of RequestStatusWithId): A list of requests with their statuses and identifiers.
  - `sortedIds` (Type: Array of bigint): A list of request identifiers sorted by id.

###### `getPendingRequestsInfo`

##### Input Parameters:

- `props: { account: Address }`
  - `account` (Type: Address): The account address.

##### Output Parameters:

- Type: Object
- Structure:

  - `pendingRequests` (Type: Array[RequestStatusWithId]): A list of requests pending finalization.
  - `pendingAmountStETH` (Type: bigint): The amount of ETH pending claiming.

## Lido contract addresses

```ts
import { LidoSDK, LIDO_CONTRACT_NAMES } from '@lidofinance/lido-ethereum-sdk';

const lidoSDK = new LidoSDK({
  rpcUrls: ['https://rpc-url'],
  chainId: 5,
});

const stethAddress = await lidoSDK.core.getContractAddress(
  LIDO_CONTRACT_NAMES.lido,
);
const wsteth = await lidoSDK.core.getContractAddress(
  LIDO_CONTRACT_NAMES.wsteth,
);
```

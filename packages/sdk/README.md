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

  - [Core](#core-example)
  - [Stake](#stake-example)
  - [Withdraw](#withdraw-example)
  - [Wrap](#wrap-example)

- [Stake](#stake)
  - [Call](#call)
  - [Populate transaction](#populate-transaction)
  - [Simulate transaction](#simulate-transaction)
- [Wrap](#wrap)
  - [Calls](#calls)
    - [Wrap ETH](#wrap-eth)
    - [Wrap stETH](#wrap-steth)
    - [Unwrap](#unwrap)
  - [Wrap utilities](#wrap-utilities)
- [Withdraw](#withdraw)

  - [Call](#call-1)

    - [Send request withdrawal with Permit](#send-request-withdrawal-with-permit)
    - [Send request withdrawal with preallocated allowance](#send-request-withdrawal-with-preallocated-allowance)
    - [`Request` other methods](#request-other-methods)
    - [Claim requests](#claim-requests)
    - [`Claim` other methods](#claim-other-methods)

  - [Withdraw utilities](#withdraw-utilities)

    - [Set allowance of WithdrawalQueue contract](#set-allowance-of-withdrawalqueue-contract)
    - [`Allowance` other methods](#allowance-other-methods)

  - [Views](#views)

    - [Constants](#constants)
    - [Requests info](#requests-info)

- [(w)stETH](#wsteth)
- [unstETH NFT](#unsteth-nft)
- [Lido contract addresses](#lido-contract-addresses)
- [Lido statistics](#lido-statistics)
  - [APR](#apr)
- [Lido events](#lido-events)
  - [Rebase](#rebase)

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
- **Stake** - provides access to the Lido staking functionality
- **Withdraw** - provides access to the Lido withdrawals functionality
- **Wrap** - provides access to the Lido wrap functionality
- **(w)stETH** - provides access to the stETH and wstETH tokens functionality
- **unstETH NFT** - provides access to the unstETH NFT functionality

## Usage

To get started with the Lido Ethereum SDK, you need to import the necessary modules:

```ts
const { LidoSDK } = require('@lidofinance/lido-ethereum-sdk');
// or
const { LidoSDKStake } = require('@lidofinance/lido-ethereum-sdk/stake');
// or
const { LidoSDKWithdraw } = require('@lidofinance/lido-ethereum-sdk/withdraw');
// or
const { LidoSDKWrap } = require('@lidofinance/lido-ethereum-sdk/wrap');
// or
const { LidoSDKCore } = require('@lidofinance/lido-ethereum-sdk/core');
// or
const { LidoSDKstETH } = require('@lidofinance/lido-ethereum-sdk/erc20');
// or
const { LidoSDKwstETH } = require('@lidofinance/lido-ethereum-sdk/erc20');
// or
const { LidoSDKUnstETH } = require('@lidofinance/lido-ethereum-sdk/unsteth');

// Or, if you are using ES6+:
import { LidoSDK } from '@lidofinance/lido-ethereum-sdk';
// or
import { LidoSDKStake } from '@lidofinance/lido-ethereum-sdk/stake';
// or
import { LidoSDKWithdraw } from '@lidofinance/lido-ethereum-sdk/withdraw';
// or
import { LidoSDKWrap } from '@lidofinance/lido-ethereum-sdk/wrap';
// or
import { LidoSDKCore } from '@lidofinance/lido-ethereum-sdk/core';
// or
import { LidoSDKstETH } from '@lidofinance/lido-ethereum-sdk/erc20';
// or
import { LidoSDKwstETH } from '@lidofinance/lido-ethereum-sdk/erc20';
// or
import { LidoSDKUnstETH } from '@lidofinance/lido-ethereum-sdk/unsteth';
```

## Initialization

Before using the SDK, you need to create an instance of the LidoSDK class:

```ts
// With own rpc provider
const sdk = new LidoSDK({
  chainId: 5,
  rpcProvider: ownRpcProvider,
  web3Provider: provider, // optional
  logMode: 'debug', // optional 'debug' | 'info'. Default: 'info'
});

// With RPC urls (without own rpc provider)
const sdk = new LidoSDK({
  chainId: 5,
  rpcUrls: [
    'https://eth-goerli.alchemyapi.io/v2/{ALCHEMY_API_KEY}',
    'https://fallback-provider',
  ],
  web3Provider: provider, // optional
  logMode: 'debug', // optional 'debug' | 'info'. Default: 'info'
});
```

Replace "https://eth-goerli.alchemyapi.io/v2/{ALCHEMY_API_KEY}" with the address of your Ethereum provider.

## Examples

### Core example

```ts
const lidoSDK = new LidoSDK({
  chainId: 5,
  rpcUrls: ['https://eth-goerli.alchemyapi.io/v2/{ALCHEMY_API_KEY}'],
});

// Views
const balanceETH = await lidoSDK.core.balanceETH(address);

console.log(balanceETH.toString(), 'ETH balance');
```

### Stake example

```ts
const lidoSDK = new LidoSDK({
  chainId: 5,
  rpcUrls: ['https://eth-goerli.alchemyapi.io/v2/{ALCHEMY_API_KEY}'],
});

// Contracts
const addressStETH = await lidoSDK.stake.contractAddressStETH();
const contractStETH = await lidoSDK.stake.getContractStETH();

// Calls
const stakeResult = await lidoSDK.stake.stakeEth({
  value,
  callback,
  referralAddress,
  account,
});

console.log(addressStETH, 'stETH contract address');
console.log(contractStETH, 'stETH contract');
console.log(stakeResult, 'stake result');
```

### Withdraw example

```ts
const lidoSDK = new LidoSDK({
  chainId: 5,
  rpcUrls: ['https://eth-goerli.alchemyapi.io/v2/{ALCHEMY_API_KEY}'],
});

// Contracts
const addressWithdrawalQueue =
  await lidoSDK.withdraw.contract.contractAddressWithdrawalQueue();
const contractWithdrawalQueue =
  await lidoSDK.withdraw.contract.getContractWithdrawalQueue();

// Calls
const requestResult = await lidoSDK.withdraw.request.requestByToken({
  account,
  requests: requestsArray,
  token: 'stETH',
  callback,
});

console.log(addressWithdrawalQueue, 'Withdrawal Queue contract address');
console.log(contractWithdrawalQueue, 'Withdrawal Queue contract');
console.log(requestResult, 'request result');
```

### Wrap example

```ts
const lidoSDK = new LidoSDK({
  chainId: 5,
  rpcUrls: ['https://eth-goerli.alchemyapi.io/v2/{ALCHEMY_API_KEY}'],
});

// Contracts
const addressWstETH = await lidoSDK.wrap.contractAddressWstETH();
const contractWstETH = await lidoSDK.withdraw.getContractWstETH();

// Calls
const wrapResult = await lidoSDK.wrap.wrapEth({
  value,
  account,
  callback,
});

console.log(addressWstETH, 'wstETH contract address');
console.log(contractWstETH, 'wstETH contract');
console.log(wrapResult, 'wrap result');
```

## Stake

### Call

Arguments:

- `value`: _string_ | _bigint_ - amount of ETH to stake (in wei)
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
  const stakeResult = await lidoSDK.stake.stakeEth({
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

const populateResult = await lidoSDK.stake.stakeEthPopulateTx({
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

const simulateResult = await lidoSDK.staking.stakeEthSimulateTx({
  value,
  callback,
  referralAddress,
  account,
});
```

## Wrap

### Calls

#### Wrap ETH

Arguments:

- `value`: _string_ | _bigint_ - amount of ETH to wrap to wstETH (staking ETH and then wrapping stETH to wstETH in a single tx)
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

#### Wrap stETH

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

// if value is more than allowance perform approve
const approveResult = await lidoSDK.wrap.approveStethForWrap({
  value,
  account,
  callback,
});

// wrap stETH
const wrapResult = await lidoSDK.wrap.wrapSteth({ value, account, callback });
```

#### Unwrap

```ts
// unwrap wstETH to receive stETH
const unwrapResult = await lidoSDK.wrap.unwrap({
  value: unwrapAmount,
  account,
  callback,
});
```

### Wrap utilities

For all transaction methods helper methods are available similar to `stake` module:

- `...populateTX`: returns ready to sign transaction object with all data encoded
- `...simulateTX`: performs dry-ran of the transaction to see if it will execute on the network

For `wrapEth` only `wrapEthEstimateGas` is available instead of `simulateTx` but you can use it all the same for checking transaction validity.

## Withdraw

### Call

#### Send request withdrawal with Permit

`Supports EOA and Multisig`

Arguments:

- `requests`: (Type: bigint[] ) - array of requests ids
- `token`: (Type: string) - token name ('stETH' | 'wstETH')
- `callback`: (Type: TransactionCallback) - callback function that will be on each stage of the transaction
- `account` (Type: Address): The account address.

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
    case TransactionCallbackStage.PERMIT:
      console.log('wait for permit');
      break;
    case TransactionCallbackStage.GAS_LIMIT:
      console.log('wait for gas limit');
      break;
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
    case TransactionCallbackStage.MULTISIG_DONE:
      console.log('multisig_done');
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
  const requestResult = await lidoSDK.withdrawals.request.requestByToken({
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

Arguments:

- `requests`: (Type: bigint[] ) - array of requests ids
- `token`: (Type: string) - token name ('stETH' | 'wstETH')
- `callback`: (Type: TransactionCallback) - callback function that will be on each stage of the transaction
- `account` (Type: Address): The account address.

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
    case TransactionCallbackStage.GAS_LIMIT:
      console.log('wait for gas limit');
      break;
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

#### Claim requests

Arguments:

- `account`: (Type: Address ): The account address.
- `requestsIds`: (Type: bigint[]): An array of request ids.
- `hints` (Type: bigint[]): An array of hints for each request.
- `callback`: (Type: TransactionCallback): callback function that will be on each stage of the transaction

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
    case TransactionCallbackStage.GAS_LIMIT:
      console.log('wait for gas limit');
      break;
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
  const claimResult = await lidoSDK.withdrawals.claim.claimRequests({
    account,
    requestsIds,
    hints,
    callback,
  });

  console.log(
    claimResult,
    'transaction hash, transaction receipt, confirmations',
  );
} catch (error) {
  console.log((error as SDKError).errorMessage, (error as SDKError).code);
}
```

#### `Claim` other methods

##### EOA

- claimRequestsEOA

##### Multisig

- claimRequestsMultisig

### Withdraw utilities

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

## (w)stETH

stETH and wstETH tokens functionality is presented trough modules with same ERC20 interface that exposes balances, allowances, transfers and ERC2612 permits signing.

```ts
const lidoSDK = new LidoSDK({
  chainId: 5,
  rpcUrls: ['https://eth-goerli.alchemyapi.io/v2/{ALCHEMY_API_KEY}'],
});

// Views
const balanceStETH = await lidoSDK.steth.balance(address);
const balanceWStETH = await lidoSDK.wsteth.balance(address);

// Contracts
const contractStETH = await lidoSDK.steth.getContract();
const addressStETH = await lidoSDK.steth.contractAddress();

const contractWStETH = await lidoSDK.wsteth.getContract();
const addressWStETH = await lidoSDK.wsteth.contractAddress();

// Calls
const transfer = await lidoSDK.steth.transfer({
  amount,
  to,
  account,
  callback,
});
```

### Transfer

```ts
const transferTx = await lidoSDK.steth.transfer({
  amount,
  to,
  from, // pass from to call transferFrom method
  account,
  callback,
});
```

### Allowance

```ts
const approveTx = await lidoSDK.steth.approve({
  amount,
  to,
  account,
  callback,
});

const allowance = await lidoSDK.steth.allowance({ to, account });
// bigint representing how much stETH is `to` address allowed to spend from `account` address
console.log(allowance);
```

### Permit

```ts
// initiate permit signing for stETH
const permit = await lidoSDK.steth.signPermit({
  amount,
  spender,
  account,
  deadline, // optional, leave empty for infinite deadline
});
```

### Token Metadata

Other helpful functions are exposed

- `erc20Metadata` returns token name, symbol, decimals and ERC2612 Domain separator.
- `nonces` returns current permit nonce for account
- `totalSupply` returns total supply of the token, for (w)stETH tokens this is a variable that changes over time
- `erc721Domain` return unhashed ERC2612 domain, used for signing permits

### Utility methods

For all transaction methods helper methods are available similar to `stake` module:

- `...populate`: returns ready to sign transaction object with all data encoded
- `...simulate`: performs dry-ran of the transaction to see if it will execute on the network

For permit signing `...populate` helpers requests and fills out all needed data for `signTypedData` RPC call

### Custom token (experimental)

Both token classes inherit from the same abstract class `AbstractLidoSDKErc20` which is exposed from `erc20` SDK module.
If you want to use this with other token extend from this abstract class and implementing`contractAddress` method that returns address of the token contract on current chain from `this.core`. Consult with source code of this sdk module to get started. Use at your own risk, be aware that this is experimental feature and ABI used may not fit your custom token fully or correctly.

## unstETH NFT

⚒️ Work In Progress ⚒️

This modules exposes NFT functionality of Lido Withdrawal Request NFT.

```ts
const lidoSDK = new LidoSDK({
  chainId: 5,
  rpcUrls: ['https://eth-goerli.alchemyapi.io/v2/{ALCHEMY_API_KEY}'],
});

// Contracts
const addressUnstETH = await lidoSDK.unsteth.contractAddress();
const contractUnstETH = await lidoSDK.unsteth.getContract();

// views
const nfts = await lidoSDK.unsteth.getNFTsByAccount(account);
const owner = await lidoSDK.unsteth.getAccountByNFT(tokenId);

// Calls
const transfer = await lidoSDK.unsteth.transfer({
  id,
  to,
  from, // optional to call transferFrom
  account,
  callback,
});
```

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

## Lido statistics

### APR

```ts
import { LidoSDK } from '@lidofinance/lido-ethereum-sdk';

const lidoSDK = new LidoSDK({
  rpcUrls: ['https://rpc-url'],
  chainId: 5,
});

const lastApr = await lidoSDK.statistics.apr.getLastApr();
const smaApr = await lidoSDK.statistics.apr.getSmaApr();

console.log(lastApr, 'last apr');
console.log(smaApr, 'sma apr');
```

## Lido events

### Rebase

```ts
import { LidoSDK } from '@lidofinance/lido-ethereum-sdk';

const lidoSDK = new LidoSDK({
  rpcUrls: ['https://rpc-url'],
  chainId: 5,
});

const lastRebaseEvent = await lidoSDK.events.stethEvents.getLastRebaseEvent();
const lastRebaseEventsByCount =
  await lidoSDK.events.stethEvents.getRebaseEvents({ count: 10 });

console.log(lastRebaseEvent, 'last rebase event');
console.log(lastRebaseEventsByCount, 'last rebase events by count');
```

<div style="display: flex;" align="center">
  <h1 align="center">Lido Ethereum SDK</h1>
</div>

<div style="display: flex;" align="center">
  <img alt="GitHub license" src="https://img.shields.io/github/license/lidofinance/lido-ethereum-sdk?color=limegreen">
  <img alt="Downloads npm" src="https://img.shields.io/npm/dm/@lidofinance/lido-ethereum-sdk?color=limegreen">
  <img alt="Version npm" src="https://img.shields.io/npm/v/@lidofinance/lido-ethereum-sdk?label=version">
  <img alt="npm bundle size" src="https://img.shields.io/bundlephobia/min/@lidofinance/lido-ethereum-sdk">
  <img alt="GitHub top language" src="https://img.shields.io/github/languages/top/lidofinance/lido-ethereum-sdk">
  <img alt="GitHub Pull Requests" src="https://img.shields.io/github/issues-pr/lidofinance/lido-ethereum-sdk">
  <img alt="GitHub open issues" src="https://img.shields.io/github/issues/lidofinance/lido-ethereum-sdk">
</div>
<br/>

**Lido Ethereum SDK** is a package that provides convenient tools for interacting with Lido contracts on the Ethereum network through a software development kit (SDK). This SDK simplifies working with Lido contracts and accessing their functionality.

## ⚒️ Work In Progress ⚒️

The project is currently under active development and may experience breaking changes in the future.

## Migration

For breaking changes between versions see [MIGRATION.md](MIGRATION.md)

## Table of contents

- [Installation](#installation)
- [Modules](#modules)
- [Usage](#usage)
  - [Import](#import)
  - [Initialization](#initialization)
  - [With web3Provider](#with-web3provider)
  - [Separate modules](#separate-modules)
- [Basic Examples](#basic-examples)
  - [Core](#core-example)
  - [Stake](#stake-example)
  - [Withdraw](#withdraw-example)
  - [Wrap](#wrap-example)
- [Error Codes](#error-codes)
- [Lido contract addresses](#lido-contract-addresses)
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
- [Shares](#shares)
- [Lido statistics](#lido-statistics)
  - [APR](#apr)
- [Lido events](#lido-events)
  - [Rebase](#rebase)
- [Rewards](#Rewards)

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
- **Shares** - provides access to the underlying share token
- **Statistics** - provides access to the Lido stats, mainly APR
- **Rewards** - provides access to historical data on stETH rewards

## Usage

### Import

To get started with the Lido Ethereum SDK, you need to import the necessary modules. You can use CJS or ES6+ imports. Import from root package or each module separately to improve on bundle size.

```ts
// CSJ
const { LidoSDK } = require('@lidofinance/lido-ethereum-sdk');
// or
const { LidoSDKStake } = require('@lidofinance/lido-ethereum-sdk/stake');
// or
```

```ts
// ES6+, all other modules are available from root
import { LidoSDK, LidoSDKStake } from '@lidofinance/lido-ethereum-sdk';

// Full list of separate imports
import { LidoSDKCore } from '@lidofinance/lido-ethereum-sdk/core';
import { LidoSDKStake } from '@lidofinance/lido-ethereum-sdk/stake';
import { LidoSDKWithdraw } from '@lidofinance/lido-ethereum-sdk/withdraw';
import { LidoSDKWrap } from '@lidofinance/lido-ethereum-sdk/wrap';
import {
  LidoSDKstETH,
  LidoSDKwstETH,
} from '@lidofinance/lido-ethereum-sdk/erc20';
import { LidoSDKUnstETH } from '@lidofinance/lido-ethereum-sdk/unsteth';
import { LidoSDKShares } from '@lidofinance/lido-ethereum-sdk/shares';
import { LidoSDKStatistics } from '@lidofinance/lido-ethereum-sdk/statistics';
import { LidoSDKRewards } from '@lidofinance/lido-ethereum-sdk/rewards';
```

### Initialization

Before using the SDK, you need to create an instance of the LidoSDK class:

Pass your own viem PublicClient:

```ts
import { LidoSDK } from '@lidofinance/lido-ethereum-sdk';
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

Or just rpc urls so it can be created under the hood:

```ts
const sdk = new LidoSDK({
  chainId: 5,
  rpcUrls: ['https://eth-goerli.alchemyapi.io/v2/{ALCHEMY_API_KEY}'],
  web3Provider: provider, // optional
});
```

Replace "https://eth-goerli.alchemyapi.io/v2/{ALCHEMY_API_KEY}" with the address of your Ethereum provider.

### With web3Provider

In order to access transaction signing functionality you need to provide viem WalletClient instance. Accessing web3 methods without web3Provider will result in error.

We support account hoisting as per Viem `WalletClient`, so passing account is not required for transactions and related functions.
Some functions don't usually require web3provider to be present like `simulate...` or `populate..` but **not passing an account** to them will result in **request to web3provider** and an **error if it is missing**.

```ts
import { LidoSDK, LidoSDKCore } from '@lidofinance/lido-ethereum-sdk';
import { createWalletClient, custom } from 'viem';
import { goerli } from 'viem/chains';

let web3Provider = createWalletClient({
  chain: goerli,
  transport: custom(window.ethereum),
});

// or use our helper to pass any eip-1193 provider
let web3Provider = LidoSDKCore.createWeb3Provider(5, window.ethereum);

const sdk = new LidoSDK({
  chainId: 5,
  rpcUrls: ['https://eth-goerli.alchemyapi.io/v2/{ALCHEMY_API_KEY}'],
  web3Provider,
});
```

### Separate modules

Every SDK module needs `LidoSDKCore` to function. You can pass same arguments as to `LidoSDKCore` constructor to create it under the hood or pass existing instance. This allows you to build up your SDK only out of parts you need.

```ts
import { LidoSDKStake } from '@lidofinance/lido-ethereum-sdk/stake';
import { LidoSDKWrap } from '@lidofinance/lido-ethereum-sdk/stake';
import { LidoSDKCore } from '@lidofinance/lido-ethereum-sdk/core';

const params = {
  chainId: 5,
  rpcUrls: ['https://eth-goerli.alchemyapi.io/v2/{ALCHEMY_API_KEY}'],
};
// core is created under the hood
const stake = new LidoSDKStake(params);

const core = new LidoSDKCore(params);
const wrap = new LidoSDKWrap({ core });
```

## Basic Examples

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
  web3provider: LidoSDKCore.createWeb3Provider(5, window.ethereum),
});

// Contracts
const addressStETH = await lidoSDK.stake.contractAddressStETH();
const contractStETH = await lidoSDK.stake.getContractStETH();

// Calls
const stakeResult = await lidoSDK.stake.stakeEth({
  value,
  callback,
  referralAddress,
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
  web3provider: LidoSDKCore.createWeb3Provider(5, window.ethereum),
});

// Contracts
const addressWithdrawalQueue =
  await lidoSDK.withdraw.contract.contractAddressWithdrawalQueue();
const contractWithdrawalQueue =
  await lidoSDK.withdraw.contract.getContractWithdrawalQueue();

// Calls
const requestResult = await lidoSDK.withdraw.request.requestByToken({
  account,
  amount: 10000000n, // `10000000` string is accepted as well
  token: 'stETH',
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
  web3provider: LidoSDKCore.createWeb3Provider(5, window.ethereum),
});

// Contracts
const addressWstETH = await lidoSDK.wrap.contractAddressWstETH();
const contractWstETH = await lidoSDK.withdraw.getContractWstETH();

// Calls
const wrapResult = await lidoSDK.wrap.wrapEth({
  value,
  account,
});

console.log(addressWstETH, 'wstETH contract address');
console.log(contractWstETH, 'wstETH contract');
console.log(wrapResult, 'wrap result');
```

## Error Codes

- **INVALID_ARGUMENT**: arguments passed to SDK method are not valid
- **NOT_SUPPORTED**: behavior or feature though possible is not currently supported by SDK
- **PROVIDER_ERROR**: error with RPC or Web3 Provider
- **READ_ERROR**: error while accessing Blockchain or External Resource for read
- **UNKNOWN_ERROR** error was not recognized by SDK and is not directly thrown by it's code

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
  LidoSDKCore,
  StakeStageCallback,
  TransactionCallbackStage,
  SDKError,
} from '@lidofinance/lido-ethereum-sdk';

const lidoSDK = new LidoSDK({
  rpcUrls: ['https://rpc-url'],
  chainId: 5,
  web3Provider: LidoSDKCore.createWeb3Provider(5, window.ethereum),
});

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
  web3Provider: LidoSDKCore.createWeb3Provider(5, window.ethereum),
});

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
  web3Provider: LidoSDKCore.createWeb3Provider(5, window.ethereum),
});

// get existing allowance
const allowance = await lidoSDK.wrap.getStethForWrapAllowance(account);

// if value is more than allowance perform approve
const approveResult = await lidoSDK.wrap.approveStethForWrap({
  value,
  callback,
});

// wrap stETH
const wrapResult = await lidoSDK.wrap.wrapSteth({ value, callback });
```

#### Unwrap

```ts
// unwrap wstETH to receive stETH
const unwrapResult = await lidoSDK.wrap.unwrap({
  value: unwrapAmount,
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

`Signing Permit is only supported for EOA`

Arguments:

- `requests`: (Type: bigint[] ) - array of requests ids
  or
- `amount`: (Type: String | BigInt ) - amount of token to withdraw, will be split into minimum amount of requests

- `token`: (Type: 'stETH' | 'wstETH') - token name
- `permit`: (Type: SignedPermit **optional**) - presigned permit, will be requested if not present
- `callback`: (Type: TransactionCallback **optional**) - callback function that will be on each stage of the transaction
- `account` (Type: Address | Account **optional**): The account address.

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
  web3Provider: LidoSDKCore.createWeb3Provider(5, window.ethereum),
});

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
  const requestResult = await lidoSDK.withdrawals.request.requestWithPermit({
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
  or
- `amount`: (Type: String | BigInt ) - amount of token to withdraw, will be split into minimum amount of requests

- `token`: (Type: string) - token name ('stETH' | 'wstETH')
- `callback`: (Type: TransactionCallback **optional**) - callback function that will be on each stage of the transaction
- `account` (Type: Address | Account **optional**): The account address.

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
  web3Provider: LidoSDKCore.createWeb3Provider(5, window.ethereum),
});

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
    amount,
    token, // 'stETH' | 'wstETH'
    callback,
  });

  console.log(
    requestResult,
    'transaction hash, transaction receipt, confirmations',
  );
} catch (error) {
  console.log((error as SDKError).errorMessage, (error as SDKError).code);
}
```

#### `Request` helpers

- `populate` and `simulate` helpers are available
- `splitAmountToRequests({amount, token})` splits token amount into minimal possible array of withdrawal requests

#### Claim requests

Arguments:

- `requestsIds`: (Type: bigint[]): An array of request ids.
- `hints` (Type: bigint[] **optional**): An array of hints per each request, will be calculated if not provided.
- `account`: (Type: Address **optional**): The account address.
- `callback`: (Type: TransactionCallback **optional**): callback function that will be on each stage of the transaction

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
  web3Provider: LidoSDKCore.createWeb3Provider(5, window.ethereum),
});

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
    requestsIds,
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

#### `Claim` helpers

`populate` and `simulate` helpers are available

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
  web3Provider: LidoSDKCore.createWeb3Provider(5, window.ethereum),
});

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

##### Views

- `populate` and `simulate` helpers are available
- `getAllowance` returns current allowance for token
- `checkAllowance` return current allowance and compares with amount to check if you need to approve

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
- minWStethWithdrawalAmount
- maxWStethWithdrawalAmount
- isPaused
- isBunkerModeActive
- isTurboModeActive

#### Requests info

###### `getWithdrawalRequestsInfo`

###### Input Parameters:

- `props: { account:  Address | Account }`
  - `account` (Type: Address | Account): The account address.

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
  - `account` (Type: Address | Account): The account address.

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
  - `account` (Type: Address | Account): The account address.

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
  - `account` (Type: Address | Account): The account address.

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

- `props: { account:  Address | Account }`
  - `account` (Type: Address | Account): The account address.

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
  web3Provider: LidoSDKCore.createWeb3Provider(5, window.ethereum),
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

## Shares

This module exposes methods of Lido(stETH) contract that allow interaction with underlying shares mechanism with interface similar to ERC20. You can query balance, transfer and convert values between shares and stETH. It's best used for tracking balances and performing operations in values unchanged by rebases.

### Example

```ts
import { LidoSDK } from '@lidofinance/lido-ethereum-sdk';

const lidoSDK = new LidoSDK({
  rpcUrls: ['https://rpc-url'],
  chainId: 5,
  web3Provider: LidoSDKCore.createWeb3Provider(5, window.ethereum),
});

const balanceShares = await lidoSDK.shares.balance(address);

// transferring shares is equivalent to transferring corresponding amount of stETH
const transferTx = await lidoSDK.shares.transfer({ account, amount, to });

// converting stETH amount to shares trough on-chain call based on actual share rate
const shares = await lidoSDK.convertToShares(1000n);
// reverse
const steth = await lidoSDK.convertToSteth(1000n);

// total supply of shares and ether in protocol
const { totalEther, totalShares } = await lidoSDK.getTotalSupply();

// get current share rate from protocol
const shareRate = await lidoSDK.getShareRate();
```

## Lido statistics

### APR

#### Methods

##### `getLastApr`

###### Output Parameters:

- Type: number

##### `getSmaApr`

###### Input Parameters:

- `props: { days }`
  - `days` (Type: number): The number of days back to return sma apr.

###### Output Parameters:

- Type: number

#### Examples

```ts
import { LidoSDK } from '@lidofinance/lido-ethereum-sdk';

const lidoSDK = new LidoSDK({
  rpcUrls: ['https://rpc-url'],
  chainId: 5,
});

const lastApr = await lidoSDK.statistics.apr.getLastApr();
const smaApr = await lidoSDK.statistics.apr.getSmaApr({ days: 7 });

console.log(lastApr, 'last apr');
console.log(smaApr, 'sma apr by 7 days');
```

## Lido events

### Rebase

#### Methods

##### `getLastRebaseEvent`

###### Output Parameters:

- Type: RebaseEvent

##### `getFirstRebaseEvent`

###### Input Parameters:

- `props: { days, fromBlockNumber }`
  - `days` (Type: number): The number of days ago from which to start searching for the first rebase event.
  - `fromBlockNumber` (Type: number | undefined): Block number from which to start the search.

###### Output Parameters:

- Type: RebaseEvent

##### `getRebaseEvents`

###### Input Parameters:

**Warning: specifying timestamp/seconds/days will result in binary search for fitting block number which will negatively affect rpc request count and execution time**

Sub types:

- `blockType` object that contains one of possible fields:

  - `block` block number(Type: BigInt) or Block Tag(excluding `pending`)
  - `timestamp` timestamp in seconds(type:BigInt) since epoch time

- `backType` object that contains one of possible fields:
  - `seconds` (Type: BigInt): seconds back
  - `days` (Type: BigInt): days back
  - `blocks` (Type: BigInt): block back

Props:

- `to` (Type: blockType **optional**) defaults to `{block:"latests"}` upper bound for events parsing
- `maxCount` (Type: number **optional**) maximum count of events to return, if omitted will return all events in range
- `stepBlock`: (Type: number **optional**) defaults to 50000, maximum block range per 1 request

- `from` (Type: blockType) lower bound for events parsing
  or
- `back` (Type: backType) alternative way to define lower bound relative to `to`

###### Output Parameters:

- Type: Array of RebaseEvent objects

##### `getLastRebaseEvents`

###### Input Parameters:

- `props: { count, stepBlock? }`
  - `count` (Type: number): how many last rebase events to return
  - `stepBlock`: (Type: number **optional**) defaults to 50000, maximum block range per 1 request

###### Output Parameters:

- Type: Array of RebaseEvent objects

#### Examples

```ts
import { LidoSDK } from '@lidofinance/lido-ethereum-sdk';

const lidoSDK = new LidoSDK({
  rpcUrls: ['https://rpc-url'],
  chainId: 5,
});

const lastRebaseEvent = await lidoSDK.events.stethEvents.getLastRebaseEvent();
const firstRebaseEvent = await lidoSDK.events.stethEvents.getFirstRebaseEvent({
  days: 3,
});
const lastRebaseEventsByCount =
  await lidoSDK.events.stethEvents.getLastRebaseEvents({ count: 7 });
const lastRebaseEventsByDays =
  await lidoSDK.events.stethEvents.getRebaseEventsByDays({ days: 7 });

console.log(lastRebaseEvent, 'last rebase event');
console.log(firstRebaseEvent, 'first rebase event');
console.log(lastRebaseEventsByCount, 'last rebase events by count');
console.log(lastRebaseEventsByDays, 'last rebase events by days');
```

## Rewards

This module allows you to query historical rewards data for given address via chain events or subgraph.

### Common Options

- **address** - (Type: Address) address of an account you want to query rewards for
- **to** (Type: [`blockType`](#`getRebaseEvents`)) defaults to `{block: "latest"}`, upper bound for query

- **from** (Type: [`blockType`](#`getRebaseEvents`)) lower bound for query
  or
- **back** (Type: [`backType`](#`getRebaseEvents`)) alternative way to define lower bound relative to `to`

- **includeZeroRebases** [default: `false` ] - include rebase events when users had no rewards(because of empty balance)
- **includeOnlyRewards** [default: `false` ] - include only rebase events

### Common Return

```Typescript
type RewardsResult = {
  // pre query states
  baseBalance: bigint;
  baseBalanceShares: bigint;
  baseShareRate: number;
  // commutative rewards in stETH
  totalRewards: bigint;
  // computed block numbers
  fromBlock: bigint;
  toBlock: bigint;
  // query result in block/logIndex ascending order
  rewards: {
    type: 'submit' | 'withdrawal' | 'rebase' | 'transfer_in' | 'transfer_out';
    change: bigint; // negative or positive change in stETH
    changeShares: bigint; // same in shares
    balance: bigint; // post event balance in stETH
    balanceShares: bigint; // same in shares
    shareRate: number; // apx share rate at a time of event
    apr?: number; // apr for rebase events
    originalEvent: RewardsChainEvents | RewardsSubgraphEvents ; // original event from chain/subgraph, contains extra info
  }[]
};
```

### Get Rewards from chain

This method heavily utilizes RPC fetching chain event logs. It's better suited for smaller,recent queries. Beware that this might cause rate limit issues on free RPC endpoints.

```ts
const lidoSDK = new LidoSDK({
  chainId: 5,
  rpcUrls: ['https://eth-goerli.alchemyapi.io/v2/{ALCHEMY_API_KEY}'],
});

const rewardsQuery = await lidoSDK.rewards.getRewardsFromChain({
  address: rewardsAddress,
  stepBlock: 10000, // defaults to 50000, max block range per 1 query
  back: {
    days: 10n,
  },
});

console.log(rewardsQuery.rewards);
```

### Get Rewards from subgraph

This method requires you to provide API URL to send subgraph requests to. It's better suited for larger, more historical queries.

#### Important notes

**to** is capped by last indexed block in subgraph. Block number is available in result object by `lastIndexedBlock`.

```ts
const lidoSDK = new LidoSDK({
  chainId: 5,
  rpcUrls: ['https://eth-goerli.alchemyapi.io/v2/{ALCHEMY_API_KEY}'],
});

const rewardsQuery = await lidoSDK.rewards.getRewardsFromSubgraph({
  address: rewardsAddress,
  blocksBack: 10000,
  stepEntities: 500, // defaults to 1000,  max entities per one request to endpoint
  getSubgraphUrl(graphId, chainId) {
    return `https://gateway.thegraph.com/api/${apiKey}/subgraphs/id/${id}`;
  },
});

console.log(rewardsQuery.rewards);
```

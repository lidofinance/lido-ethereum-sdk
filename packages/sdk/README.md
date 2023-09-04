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
    - [Request withdrawal with Permit (EOA and contract)](#request-withdrawal-with-permit-eoa-and-contract)
    - [Request withdrawal without Permit (EOA and contract)](#request-withdrawal-without-permit-eoa-and-contract)
    - [Request withdrawal with Permit (EOA)](#request-withdrawal-with-permit-eoa)
    - [Request withdrawal (contract)](#request-withdrawal-contract)
    - [Request withdrawal for stETH with Permit (EOA)](#request-withdrawal-for-steth-with-permit-eoa)
    - [Request withdrawal for stETH without Permit (EOA)](#request-withdrawal-for-steth-without-permit-eoa)
    - [Request withdrawal for wstETH with Permit (EOA)](#request-withdrawal-for-wsteth-with-permit-eoa)
    - [Request withdrawal for wstETH without Permit (EOA)](#request-withdrawal-for-wsteth-without-permit-eoa)
    - [Request withdrawal for stETH (contract)](#request-withdrawal-for-steth-contract)
    - [Request withdrawal for wstETH (contract)](#request-withdrawal-for-wsteth-contract)
    - [Approval of Withdrawal contract (EOA and contract)](#approval-of-withdrawal-contract-eoa-and-contract)
    - [Approval of Withdrawal contract (EOA)](#approval-of-withdrawal-contract-eoa)
    - [Approval of Withdrawal contract (contract)](#approval-of-withdrawal-contract-contract)
    - [Approval of Withdrawal contract for stETH (EOA)](#approval-of-withdrawal-contract-for-steth-eoa)
    - [Approval of Withdrawal contract for wstETH (EOA)](#approval-of-withdrawal-contract-for-wsteth-eoa)
    - [Approval of Withdrawal contract for stETH (contract)](#approval-of-withdrawal-contract-for-steth-contract)
    - [Approval of Withdrawal contract for wstETH (contract)](#approval-of-withdrawal-contract-for-wsteth-contract)
  - [Views] TODO
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
  StakeCallbackStages,
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
    case StakeCallbackStages.SIGN:
      console.log('wait for sign');
      break;
    case StakeCallbackStages.RECEIPT:
      console.log('wait for receipt');
      console.log(payload, 'transaction hash');
      break;
    case StakeCallbackStages.CONFIRMATION:
      console.log('wait for confirmation');
      console.log(payload, 'transaction receipt');
      break;
    case StakeCallbackStages.DONE:
      console.log('done');
      console.log(payload, 'transaction confirmations');
      break;
    case StakeCallbackStages.ERROR:
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

## Withdrawal

### Call

#### Request withdrawal with Permit (EOA and contract)

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
  const requestResult = await lidoSDK.withdrawals.request({
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

#### Request withdrawal without Permit (EOA and contract)

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
  const requestResult = await lidoSDK.withdrawals.requestWithoutPermit({
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

#### Request withdrawal with Permit (EOA)

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
    case RequestCallbackStages.ERROR:
      console.log('error');
      console.log(payload, 'error object with code and message');
      break;
    default:
  }
};

try {
  const requestResult = await lidoSDK.withdrawals.requestWithPermit({
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

#### Request withdrawal (contract)

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
    case RequestCallbackStages.SIGN:
      console.log('wait for sign');
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
  const requestResult = await lidoSDK.withdrawals.requestMultisig({
    requests,
    token, // 'stETH' | 'wstETH'
    callback,
    account,
  });

  console.log(requestResult, 'transaction hash');
} catch (error) {
  console.log((error as SDKError).errorMessage, (error as SDKError).code);
}
```

#### Request withdrawal for stETH with Permit (EOA)

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
    case RequestCallbackStages.ERROR:
      console.log('error');
      console.log(payload, 'error object with code and message');
      break;
    default:
  }
};

try {
  const requestResult = await lidoSDK.withdrawals.requestStethWithPermit({
    amount,
    requests,
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

#### Request withdrawal for stETH without Permit (EOA)

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
    case RequestCallbackStages.ERROR:
      console.log('error');
      console.log(payload, 'error object with code and message');
      break;
    default:
  }
};

try {
  const requestResult = await lidoSDK.withdrawals.requestStethWithoutPermit({
    requests,
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

#### Request withdrawal for wstETH with Permit (EOA)

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
    case RequestCallbackStages.ERROR:
      console.log('error');
      console.log(payload, 'error object with code and message');
      break;
    default:
  }
};

try {
  const requestResult = await lidoSDK.withdrawals.requestWstethWithoutPermit({
    amount,
    requests,
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

#### Request withdrawal for wstETH without Permit (EOA)

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
  const requestResult = await lidoSDK.withdrawals.requestWstethWithoutPermit({
    requests,
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

#### Request withdrawal for wstETH without Permit (EOA)

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
  const requestResult = await lidoSDK.withdrawals.requestWstethWithoutPermit({
    requests,
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

#### Request withdrawal for stETH (contract)

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
    case RequestCallbackStages.SIGN:
      console.log('wait for sign');
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
  const requestResult = await lidoSDK.withdrawals.requestStethMultisig({
    requests,
    callback,
    account,
  });

  console.log(requestResult, 'transaction hash');
} catch (error) {
  console.log((error as SDKError).errorMessage, (error as SDKError).code);
}
```

#### Request withdrawal for wstETH (contract)

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
    case RequestCallbackStages.SIGN:
      console.log('wait for sign');
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
  const requestResult = await lidoSDK.withdrawals.requestWstethMultisig({
    requests,
    callback,
    account,
  });

  console.log(requestResult, 'transaction hash');
} catch (error) {
  console.log((error as SDKError).errorMessage, (error as SDKError).code);
}
```

#### Approval of Withdrawal contract (EOA and contract)

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
  const approveResult = await lidoSDK.withdrawals.approve({
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

#### Approval of Withdrawal contract (EOA)

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
  const approveResult = await lidoSDK.withdrawals.approveEOA({
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

#### Approval of Withdrawal contract (contract)

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
    case ApproveCallbackStages.SIGN:
      console.log('wait for sign');
      break;
    case ApproveCallbackStages.MULTISIG_DONE:
      console.log('multisig_done');
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
  const approveResult = await lidoSDK.withdrawals.approveMultisig({
    amount,
    token, // 'stETH' | 'wstETH'
    callback,
    account,
  });

  console.log(approveResult, 'transaction hash');
} catch (error) {
  console.log((error as SDKError).errorMessage, (error as SDKError).code);
}
```

#### Approval of Withdrawal contract for stETH (EOA)

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
  const approveResult = await lidoSDK.withdrawals.approveSteth({
    amount,
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

#### Approval of Withdrawal contract for wstETH (EOA)

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
  const approveResult = await lidoSDK.withdrawals.approveWsteth({
    amount,
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

#### Approval of Withdrawal contract for stETH (contract)

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
    case ApproveCallbackStages.SIGN:
      console.log('wait for sign');
      break;
    case ApproveCallbackStages.RECEIPT:
      console.log('wait for receipt');
      console.log(payload, 'transaction hash');
      break;
    case ApproveCallbackStages.MULTISIG_DONE:
      console.log('multisig_done');
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
  const approveResult = await lidoSDK.withdrawals.approveStethMultisig({
    amount,
    token, // 'stETH' | 'wstETH'
    callback,
    account,
  });

  console.log(approveResult, 'transaction hash');
} catch (error) {
  console.log((error as SDKError).errorMessage, (error as SDKError).code);
}
```

#### Approval of Withdrawal contract for wstETH (contract)

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
    case ApproveCallbackStages.SIGN:
      console.log('wait for sign');
      break;
    case ApproveCallbackStages.RECEIPT:
      console.log('wait for receipt');
      console.log(payload, 'transaction hash');
      break;
    case ApproveCallbackStages.MULTISIG_DONE:
      console.log('multisig_done');
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
  const approveResult = await lidoSDK.withdrawals.approveWstethMultisig({
    amount,
    token, // 'stETH' | 'wstETH'
    callback,
    account,
  });

  console.log(approveResult, 'transaction hash');
} catch (error) {
  console.log((error as SDKError).errorMessage, (error as SDKError).code);
}
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

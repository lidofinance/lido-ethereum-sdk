---
sidebar_position: 7
---

# Withdraw

## Call

### Send request withdrawal with Permit

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
  rpcUrls: ['<RPC_URL>'],
  chainId: 17000,
  web3Provider: LidoSDKCore.createWeb3Provider(17000, window.ethereum),
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
  const requestTx = await lidoSDK.withdrawals.request.requestWithPermit({
    requests,
    token, // 'stETH' | 'wstETH'
    callback,
    account,
  });

  console.log(
    'transaction hash, transaction receipt, confirmations',
    requestResult,
    'array of requests(nfts) created with ids, amounts,creator, owner',
    request.results.requests,
  );
} catch (error) {
  console.log((error as SDKError).errorMessage, (error as SDKError).code);
}
```

### Send request withdrawal with preallocated allowance

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
  rpcUrls: ['<RPC_URL>'],
  chainId: 17000,
  web3Provider: LidoSDKCore.createWeb3Provider(17000, window.ethereum),
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
  const requestResult = await lidoSDK.withdrawals.request.requestWithdrawal({
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

### `Request` helpers

- `populate` and `simulate` helpers are available
- `splitAmountToRequests({amount, token})` splits token amount into minimal possible array of withdrawal requests

### Claim requests

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
  rpcUrls: ['<RPC_URL>'],
  chainId: 17000,
  web3Provider: LidoSDKCore.createWeb3Provider(17000, window.ethereum),
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
  const claimTx = await lidoSDK.withdrawals.claim.claimRequests({
    requestsIds,
    callback,
  });

  console.log(
    claimTx,
    'transaction hash, transaction receipt, confirmations',
    claim.result.requests,
    'array of claimed requests, with amounts of ETH claimed',
  );
} catch (error) {
  console.log((error as SDKError).errorMessage, (error as SDKError).code);
}
```

### `Claim` helpers

`populate` and `simulate` helpers are available

### Withdraw utilities

### Set allowance of WithdrawalQueue contract

`Supports EOA and Multisig`

```ts
import {
  LidoSDK,
  ApproveCallbackStages,
  ApproveStageCallback,
  SDKError,
} from '@lidofinance/lido-ethereum-sdk';

const lidoSDK = new LidoSDK({
  rpcUrls: ['<RPC_URL>'],
  chainId: 17000,
  web3Provider: LidoSDKCore.createWeb3Provider(17000, window.ethereum),
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

### `Allowance` other methods

#### Views

- `populate` and `simulate` helpers are available
- `getAllowance` returns current allowance for token
- `checkAllowance` return current allowance and compares with amount to check if you need to approve

## Views

- getWithdrawalRequestsIds
- getLastCheckpointIndex
- getWithdrawalStatus
- findCheckpointHints
- getClaimableEther
- getUnfinalizedStETH

### Constants

- minStethWithdrawalAmount
- maxStethWithdrawalAmount
- minWStethWithdrawalAmount
- maxWStethWithdrawalAmount
- isPaused
- isBunkerModeActive
- isTurboModeActive

### Requests info

##### `getWithdrawalRequestsInfo`

##### Input Parameters:

- `props: { account:  Address | Account }`
  - `account` (Type: Address | Account): The account address.

#### Output Parameters:

- Type: Object
- Structure:

  - `claimableInfo` (Type: Object): Information about withdrawal requests that can be claimed.
    - `claimableRequests` (Type: Array[RequestStatusWithId]): A list of requests with their statuses and identifiers.
    - `claimableAmountStETH` (Type: bigint): The amount of ETH available for claiming.
  - `pendingInfo` (Type: Object): Information about pending withdrawal requests.
    - `pendingRequests` (Type: Array[RequestStatusWithId]): A list of requests with their statuses and identifiers.
    - `pendingAmountStETH` (Type: bigint): The amount of ETH pending for withdrawal.
  - `claimableETH` (Type: bigint): The amount of ETH available for claiming.

##### `getWithdrawalRequestsStatus`

##### Input Parameters:

- `props: { account: Address }`
  - `account` (Type: Address | Account): The account address.

#### Output Parameters:

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

##### `getClaimableRequestsInfo`

##### Input Parameters:

- `props: { account: Address }`
  - `account` (Type: Address | Account): The account address.

##### Output Parameters:

- Type: Object
- Structure:

  - `claimableRequests` (Type: Array[RequestStatusWithId]): A list of requests that can be claimed.
  - `claimableAmountStETH` (Type: bigint): The amount of ETH available for claiming.

##### `getClaimableRequestsETHByIds`

##### Input Parameters:

- `props: { claimableRequestsIds: (bigint | RequestStatusWithId)[] }`
  - `claimableRequestsIds` (Type: Array): An array of request identifiers for which information is needed.

##### Output Parameters:

- Type: Object
- Structure:

  - `ethByRequests` (Type: Array of bigint): A list of ETH amounts for each request.
  - `ethSum` (Type: bigint): The sum of all ETH amounts in the list.
  - `hints` (Type: Array of bigint): A list of hints for each request.

##### `getClaimableRequestsETHByAccount`

##### Input Parameters:

- `props: { account: Address }`
  - `account` (Type: Address | Account): The account address.

##### Output Parameters:

- Type: Object
- Structure:

  - `ethByRequests` (Type: Array of bigint): A list of ETH amounts for each request.
  - `ethSum` (Type: bigint): The sum of all ETH amounts in the list.
  - `hints` (Type: Array of bigint): A list of hints for each request.
  - `requests` (Type: Array of RequestStatusWithId): A list of requests with their statuses and identifiers.
  - `sortedIds` (Type: Array of bigint): A list of request identifiers sorted by id.

##### `getPendingRequestsInfo`

#### Input Parameters:

- `props: { account:  Address | Account }`
  - `account` (Type: Address | Account): The account address.

#### Output Parameters:

- Type: Object
- Structure:

  - `pendingRequests` (Type: Array[RequestStatusWithId]): A list of requests pending finalization.
  - `pendingAmountStETH` (Type: bigint): The amount of ETH pending claiming.

## Waiting time

### Methods

#### Get time by amount

##### `getWithdrawalWaitingTimeByAmount`

##### Input Parameters:

- `props: { amount?:  bigint }`
  - `amount?` (Type: bigint **optional**): The amount of withdrawable eth. In case when it is not passed, it is calculated as default information about queue.

#### Output Parameters:

- Type: Object
- Structure:
  - `requestInfo` (Type: Object): Information about withdrawal request
    - `finalizationIn` (Type: number): The time needed for withdrawal in milliseconds.
    - `finalizationAt` (Type: string): The time when request finalized for withdrawal.
    - `type` (Type: WaitingTimeCalculationType): Type of final source of eth for withdrawal.
  - `status` (Type: WaitingTimeStatus): Status of withdrawal request.
  - `nextCalculationAt` (Type: string): Time when next calculation can be changed.

#### Get time by request ids

##### `getWithdrawalWaitingTimeByRequestIds`

##### Input Parameters:

- `props: { ids: bigint[] }`
  - `ids` (ids: Array[bigint]): The ids of withdrawal requests.

#### Output Parameters:

- Type: Array of WithdrawalWaitingTimeRequestInfo objects
- Structure of each object:
  - `requestInfo` (Type: RequestByIdInfoDto): Information about withdrawal request.
    - `finalizationIn` (Type: number): The time needed for withdrawal in milliseconds.
    - `finalizationAt` (Type: string): The time when request finalized for withdrawal.
    - `requestId` (Type: string): The request id.
    - `requestedAt` (Type: string): The time when withdrawal requested.
    - `type` (Type: WaitingTimeCalculationType): Type of final source of eth for withdrawal.
  - `status` (Type: WaitingTimeStatus): Status of withdrawal request.
  - `nextCalculationAt` (Type: string): Time when next calculation can be changed.

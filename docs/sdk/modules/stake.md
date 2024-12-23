---
sidebar_position: 5
---

# Stake

## Call

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
  rpcUrls: ['<RPC_URL>'],
  chainId: 17000,
  web3Provider: LidoSDKCore.createWeb3Provider(1700, window.ethereum),
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
  const stakeTx = await lidoSDK.stake.stakeEth({
    value,
    callback,
    referralAddress,
    account,
  });

  console.log(
    stakeTx,
    'transaction hash, transaction receipt, confirmations, stake result',
    stakeTx.result.stethReceived,
    stakeTx.result.sharesReceived,
  );
} catch (error) {
  console.log((error as SDKError).errorMessage, (error as SDKError).code);
}
```

## Populate transaction

```ts
import { LidoSDK } from '@lidofinance/lido-ethereum-sdk';

const lidoSDK = new LidoSDK({
  rpcUrls: ['<RPC_URL>'],
  chainId: 17000,
});

const populateResult = await lidoSDK.stake.stakeEthPopulateTx({
  value,
  callback,
  referralAddress,
  account,
});

console.log(populateResult, 'to, from, value, data');
```

## Simulate transaction

```ts
import { LidoSDK } from '@lidofinance/lido-ethereum-sdk';

const lidoSDK = new LidoSDK({
  rpcUrls: ['<RPC_URL>'],
  chainId: 17000,
});

const simulateResult = await lidoSDK.staking.stakeEthSimulateTx({
  value,
  callback,
  referralAddress,
  account,
});
```

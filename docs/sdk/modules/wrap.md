---
sidebar_position: 6
---

# Wrap

## Calls

### Wrap ETH

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
  rpcUrls: ['<RPC_URL>'],
  chainId: 17000,
  web3Provider: LidoSDKCore.createWeb3Provider(17000, window.ethereum),
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
  const wrapTx = await lidoSDK.staking.wrapETH({
    value,
    callback,
    account,
  });

  console.log(
    wrapTx,
    'transaction hash, transaction receipt, confirmations, wrap result',
    wrapTx.result.stethWrapped,
    wrapTx.result.wstethReceived,
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
  rpcUrls: ['<RPC_URL>'],
  chainId: 17000,
  web3Provider: LidoSDKCore.createWeb3Provider(17000, window.ethereum),
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

### Unwrap

```ts
// unwrap wstETH to receive stETH
const unwrapTx = await lidoSDK.wrap.unwrap({
  value: unwrapAmount,
  callback,
});

console.log(unwrapTx.result.stethReceived, unwrapTx.result.wstethUnwrapped);
```

## Wrap utilities

For all transaction methods helper methods are available similar to `stake` module:

- `...populateTX`: returns ready to sign transaction object with all data encoded
- `...simulateTX`: performs dry-ran of the transaction to see if it will execute on the network

For `wrapEth` only `wrapEthEstimateGas` is available instead of `simulateTx` but you can use it all the same for checking transaction validity.

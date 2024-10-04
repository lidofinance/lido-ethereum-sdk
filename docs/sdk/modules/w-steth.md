---
sidebar_position: 8
---

# (w)stETH

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

## Transfer

```ts
const transferTx = await lidoSDK.steth.transfer({
  amount,
  to,
  from, // pass from to call transferFrom method
  account,
  callback,
});
```

## Allowance

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

## Permit

```ts
// initiate permit signing for stETH
const permit = await lidoSDK.steth.signPermit({
  amount,
  spender,
  account,
  deadline, // optional, leave empty for infinite deadline
});
```

## Token Metadata

Other helpful functions are exposed

- `erc20Metadata` returns token name, symbol, decimals and ERC2612 Domain separator.
- `nonces` returns current permit nonce for account
- `totalSupply` returns total supply of the token, for (w)stETH tokens this is a variable that changes over time
- `erc721Domain` return unhashed ERC2612 domain, used for signing permits

## Utility methods

For all transaction methods helper methods are available similar to `stake` module:

- `...populate`: returns ready to sign transaction object with all data encoded
- `...simulate`: performs dry-ran of the transaction to see if it will execute on the network

For permit signing `...populate` helpers requests and fills out all needed data for `signTypedData` RPC call

## Custom token (experimental)

Both token classes inherit from the same abstract class `AbstractLidoSDKErc20` which is exposed from `erc20` SDK module.
If you want to use this with other token extend from this abstract class and implementing`contractAddress` method that returns address of the token contract on current chain from `this.core`. Consult with source code of this sdk module to get started. Use at your own risk, be aware that this is experimental feature and ABI used may not fit your custom token fully or correctly.

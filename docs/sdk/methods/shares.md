---
sidebar_position: 10
---

# Shares

This module exposes methods of Lido(stETH) contract that allow interaction with underlying shares mechanism with interface similar to ERC20. You can query balance, transfer and convert values between shares and stETH. It's best used for tracking balances and performing operations in values unchanged by rebases.

## Example

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

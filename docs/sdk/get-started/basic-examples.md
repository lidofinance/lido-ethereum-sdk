---
sidebar_position: 2
---

# Basic Examples

## Core example

```ts
import { LidoSDK } from '@lidofinance/lido-ethereum-sdk';
import { http, createPublicClient, hoodi } from 'viem';

const lidoSDK = new LidoSDK({
  chainId: 17000,
  publicClient: createPublicClient({
    chain: hoodi,
    transport: http('<RPC_URL>'),
  }),
});

// Views
const balanceETH = await lidoSDK.core.balanceETH(address);

console.log(balanceETH.toString(), 'ETH balance');
```

## Stake example

```ts
import { createWalletClient, custom, hoodi, createPublicClient } from 'viem';

const lidoSDK = new LidoSDK({
  chainId: 17000,
  publicClient: createPublicClient({
    chain: hoodi,
    transport: http('<RPC_URL>'),
  }),
  walletClient: createWalletClient({
    chain: hoodi,
    transport: custom(window.ethereum),
  }),
});

// Contracts
const addressStETH = await lidoSDK.stake.contractAddressStETH();
const contractStETH = await lidoSDK.stake.getContractStETH();

// Calls
const stakeTx = await lidoSDK.stake.stakeEth({
  value,
  callback,
  referralAddress,
});

console.log(addressStETH, 'stETH contract address');
console.log(contractStETH, 'stETH contract');
console.log(stakeTx, 'stake tx result');
```

## Withdraw example

```ts
import {
  createWalletClient,
  custom,
  hoodi,
  http,
  createPublicClient,
} from 'viem';

const lidoSDK = new LidoSDK({
  chainId: 17000,
  publicClient: createPublicClient({
    chain: hoodi,
    transport: http('<RPC_URL>'),
  }),
  walletClient: createWalletClient({
    chain: hoodi,
    transport: custom(window.ethereum),
  }),
});

// Contracts
const addressWithdrawalQueue =
  await lidoSDK.withdraw.contract.contractAddressWithdrawalQueue();
const contractWithdrawalQueue =
  await lidoSDK.withdraw.contract.getContractWithdrawalQueue();

// Calls
const requestTx = await lidoSDK.withdraw.request.requestWithdrawalWithPermit({
  amount: 10000000n, // `10000000` string is accepted as well
  token: 'stETH',
  // account will be requested from provider
});

console.log(addressWithdrawalQueue, 'Withdrawal Queue contract address');
console.log(contractWithdrawalQueue, 'Withdrawal Queue contract');
console.log(requestTx.result.requests, 'array of created requests');
```

## Wrap example

```ts
import {
  createWalletClient,
  custom,
  hoodi,
  http,
  createPublicClient,
} from 'viem';

const lidoSDK = new LidoSDK({
  chainId: 17000,
  publicClient: createPublicClient({
    chain: hoodi,
    transport: http('<RPC_URL>'),
  }),
  walletClient: createWalletClient({
    chain: hoodi,
    transport: custom(window.ethereum),
  }),
});

// Contracts
const addressWstETH = await lidoSDK.wrap.contractAddressWstETH();
const contractWstETH = await lidoSDK.withdraw.getContractWstETH();

// Calls
const wrapTx = await lidoSDK.wrap.wrapEth({
  value,
  account,
});

const { stethWrapped, wstethReceived } = wrapTx.result;

console.log(addressWstETH, 'wstETH contract address');
console.log(contractWstETH, 'wstETH contract');
console.log({ stethWrapped, wstethReceived }, 'wrap result');
```

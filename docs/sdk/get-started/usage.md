---
sidebar_position: 1
---

# Usage

## Import

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

## Initialization

Before using the SDK, you need to create an instance of the LidoSDK class:

Pass your own viem PublicClient:

```ts
import { LidoSDK } from '@lidofinance/lido-ethereum-sdk';
import { createPublicClient, http } from 'viem';
import { holesky } from 'viem/chains';

const rpcProvider = createPublicClient({
  chain: holesky,
  transport: http(),
});
const sdk = new LidoSDK({
  chainId: 17000,
  rpcProvider,
  web3Provider: provider, // optional
});
```

Or just rpc urls so it can be created under the hood:

```ts
const sdk = new LidoSDK({
  chainId: 17000,
  rpcUrls: ['<RPC_URL>'],
  web3Provider: provider, // optional
});
```

Replace `<RPC_URL>` with the address of your Ethereum provider.

## With web3Provider

In order to access transaction signing functionality you need to provide viem WalletClient instance. Accessing web3 methods without web3Provider will result in error.

We support account hoisting as per Viem `WalletClient`, so passing account is not required for transactions and related functions.
Some functions don't usually require web3provider to be present like `simulate...` or `populate..` but **not passing an account** to them will result in **request to web3provider** and an **error if it is missing**.

```ts
import { LidoSDK, LidoSDKCore } from '@lidofinance/lido-ethereum-sdk';
import { createWalletClient, custom } from 'viem';
import { holesky } from 'viem/chains';

let web3Provider = createWalletClient({
  chain: holesky,
  transport: custom(window.ethereum),
});

// or use our helper to pass any eip-1193 provider
let web3Provider = LidoSDKCore.createWeb3Provider(17000, window.ethereum);

const sdk = new LidoSDK({
  chainId: 17000,
  rpcUrls: ['<RPC_URL>'],
  web3Provider,
});
```

## Separate modules

Every SDK module needs `LidoSDKCore` to function. You can pass same arguments as to `LidoSDKCore` constructor to create it under the hood or pass existing instance. This allows you to build up your SDK only out of parts you need.

```ts
import { LidoSDKStake } from '@lidofinance/lido-ethereum-sdk/stake';
import { LidoSDKWrap } from '@lidofinance/lido-ethereum-sdk/stake';
import { LidoSDKCore } from '@lidofinance/lido-ethereum-sdk/core';

const params = {
  chainId: 1700,
  rpcUrls: ['<RPC_URL>'],
};
// core is created under the hood
const stake = new LidoSDKStake(params);

const core = new LidoSDKCore(params);
const wrap = new LidoSDKWrap({ core });
```

---
sidebar_position: 10
---

# Shares

This module exposes stETH shares functionality with an ERC20-like interface.
It is useful when you need rebase-stable accounting (shares) and deterministic
off-chain conversions between stETH and shares.

## Access

```ts
import { LidoSDK, LidoSDKCore } from '@lidofinance/lido-ethereum-sdk';

const lidoSDK = new LidoSDK({
  rpcUrls: ['<RPC_URL>'],
  chainId: 17000,
  web3Provider: LidoSDKCore.createWeb3Provider(17000, window.ethereum),
});

const shares = lidoSDK.shares;
```

## Core methods

- `balance(address?)` - shares balance for account
- `transfer(props)` - transfer shares
- `populateTransfer(props)` - get transaction data for transfer
- `simulateTransfer(props)` - simulate transfer call

## Conversion methods

- `convertToShares(stethAmount)` - on-chain conversion via `getSharesByPooledEth`
- `convertToSteth(sharesAmount)` - on-chain conversion via `getPooledEthByShares`
- `convertBatchStethToShares(stethAmounts, shareRateValues?)` - batch
  conversion, optionally reusing one share-rate snapshot
- `convertBatchSharesToSteth(sharesAmounts, shareRateValues?)` - batch
  conversion, supports optional per-item rounding up
- `getSharesByPooledEth(stethAmount, shareRateValues?)` - off-chain replica
  formula
- `getPooledEthByShares(sharesAmount, shareRateValues?)` - off-chain replica
  formula
- `getPooledEthBySharesRoundUp(sharesAmount, shareRateValues?)` - off-chain
  replica formula with ceil rounding

## Share-rate helpers

- `getTotalSupply()` - returns `{ totalEther, totalShares }`
- `getShareRate()` - returns current share rate number

## Example

```ts
import {
  LidoSDK,
  LidoSDKCore,
} from '@lidofinance/lido-ethereum-sdk';

const lidoSDK = new LidoSDK({
  rpcUrls: ['<RPC_URL>'],
  chainId: 17000,
  web3Provider: LidoSDKCore.createWeb3Provider(17000, window.ethereum),
});

const account = '<ACCOUNT_ADDRESS>';
const to = '<RECIPIENT_ADDRESS>';

const sharesBalance = await lidoSDK.shares.balance(account);

const transferTx = await lidoSDK.shares.transfer({
  account,
  to,
  amount: 1_000_000_000_000_000_000n,
});

const sharesValue = await lidoSDK.shares.convertToShares(1_000n);
const stethValue = await lidoSDK.shares.convertToSteth(1_000n);

const shareRateValues = await lidoSDK.shares.getTotalSupply();

const stethBatch = await lidoSDK.shares.convertBatchSharesToSteth(
  [
    100n,
    '200',
    { amount: 1_000_000_000_000_000_000n, roundUp: true },
  ],
  shareRateValues,
);

const sharesBatch = await lidoSDK.shares.convertBatchStethToShares(
  [100n, 200n, 300n],
  shareRateValues,
);

const pooledEthRoundUp = await lidoSDK.shares.getPooledEthBySharesRoundUp(
  1000n,
  shareRateValues,
);
```

## Notes

- `convertBatchSharesToSteth` accepts:
  `Array<EtherValue | { amount: EtherValue; roundUp?: boolean }>`
- Off-chain replica methods validate max input size and zero-total edge cases.
- Reusing `shareRateValues` keeps all batch conversions consistent to one
  snapshot.

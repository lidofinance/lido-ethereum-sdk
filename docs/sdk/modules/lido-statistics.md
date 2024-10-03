---
sidebar_position: 11
---

# Lido statistics

## APR

### Methods

#### `getLastApr`

##### Output Parameters:

- Type: number

#### `getSmaApr`

##### Input Parameters:

- `props: { days }`
  - `days` (Type: number): The number of days back to return sma apr.

##### Output Parameters:

- Type: number

### Examples

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

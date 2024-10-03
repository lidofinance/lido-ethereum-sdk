---
sidebar_position: 12
---

# Lido events

## Rebase

### Methods

#### `getLastRebaseEvent`

##### Output Parameters:

- Type: RebaseEvent

#### `getFirstRebaseEvent`

##### Input Parameters:

- `props: { days, fromBlockNumber }`
  - `days` (Type: number): The number of days ago from which to start searching for the first rebase event.
  - `fromBlockNumber` (Type: number | undefined): Block number from which to start the search.

##### Output Parameters:

- Type: RebaseEvent

#### `getRebaseEvents`

##### Input Parameters:

**Warning: specifying timestamp/seconds/days will result in binary search for fitting block number which will negatively affect rpc request count and execution time**

Sub types:

- `blockType` object that contains one of possible fields:

  - `block` block number(Type: BigInt) or Block Tag(excluding `pending`)
  - `timestamp` timestamp in seconds(type:BigInt) since epoch time

- `backType` object that contains one of possible fields:
  - `seconds` (Type: BigInt): seconds back
  - `days` (Type: BigInt): days back
  - `blocks` (Type: BigInt): block back

Props:

- `to` (Type: blockType **optional**) defaults to `{block:"latests"}` upper bound for events parsing
- `maxCount` (Type: number **optional**) maximum count of events to return, if omitted will return all events in range
- `stepBlock`: (Type: number **optional**) defaults to 50000, maximum block range per 1 request

- `from` (Type: blockType) lower bound for events parsing
  or
- `back` (Type: backType) alternative way to define lower bound relative to `to`

##### Output Parameters:

- Type: Array of RebaseEvent objects

#### `getLastRebaseEvents`

##### Input Parameters:

- `props: { count, stepBlock? }`
  - `count` (Type: number): how many last rebase events to return
  - `stepBlock`: (Type: number **optional**) defaults to 50000, maximum block range per 1 request

##### Output Parameters:

- Type: Array of RebaseEvent objects

### Examples

```ts
import { LidoSDK } from '@lidofinance/lido-ethereum-sdk';

const lidoSDK = new LidoSDK({
  rpcUrls: ['https://rpc-url'],
  chainId: 5,
});

const lastRebaseEvent = await lidoSDK.events.stethEvents.getLastRebaseEvent();
const firstRebaseEvent = await lidoSDK.events.stethEvents.getFirstRebaseEvent({
  days: 3,
});
const lastRebaseEventsByCount =
  await lidoSDK.events.stethEvents.getLastRebaseEvents({ count: 7 });
const lastRebaseEventsByDays =
  await lidoSDK.events.stethEvents.getRebaseEventsByDays({ days: 7 });

console.log(lastRebaseEvent, 'last rebase event');
console.log(firstRebaseEvent, 'first rebase event');
console.log(lastRebaseEventsByCount, 'last rebase events by count');
console.log(lastRebaseEventsByDays, 'last rebase events by days');
```

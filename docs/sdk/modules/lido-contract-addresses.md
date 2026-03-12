---
sidebar_position: 4
---

# Lido contract addresses

```ts
import { LidoSDK, LIDO_CONTRACT_NAMES } from '@lidofinance/lido-ethereum-sdk';
import { http, createPublicClient, hoodi } from 'viem';

const lidoSDK = new LidoSDK({
  publicClient: createPublicClient({
    chain: hoodi,
    transport: http('<RPC_URL>'),
  }),
});

const stethAddress = await lidoSDK.core.getContractAddress(
  LIDO_CONTRACT_NAMES.lido,
);
const wsteth = await lidoSDK.core.getContractAddress(
  LIDO_CONTRACT_NAMES.wsteth,
);
```

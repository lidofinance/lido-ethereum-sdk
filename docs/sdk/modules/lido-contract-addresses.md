---
sidebar_position: 4
---

# Lido contract addresses

```ts
import { LidoSDK, LIDO_CONTRACT_NAMES } from '@lidofinance/lido-ethereum-sdk';

const lidoSDK = new LidoSDK({
  rpcUrls: ['https://rpc-url'],
  chainId: 5,
});

const stethAddress = await lidoSDK.core.getContractAddress(
  LIDO_CONTRACT_NAMES.lido,
);
const wsteth = await lidoSDK.core.getContractAddress(
  LIDO_CONTRACT_NAMES.wsteth,
);
```

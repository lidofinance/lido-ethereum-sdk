---
sidebar_position: 9
---

# unstETH NFT

This modules exposes NFT functionality of Lido Withdrawal Request NFT.

```ts
const lidoSDK = new LidoSDK({
  chainId: 17000,
  rpcUrls: ['<RPC_URL>'],
});

// Contracts
const addressUnstETH = await lidoSDK.unsteth.contractAddress();
const contractUnstETH = await lidoSDK.unsteth.getContract();

// views
const nfts = await lidoSDK.unsteth.getNFTsByAccount(account);
const owner = await lidoSDK.unsteth.getAccountByNFT(tokenId);

// Calls
const transfer = await lidoSDK.unsteth.transfer({
  id,
  to,
  from, // optional to call transferFrom
  account,
  callback,
});
```

---
sidebar_position: 3
---

# Error Codes

Every error thrown by the SDK is an `SDKError` carrying a `code` and,
sometimes, a more specific `reason`.

## `code` — broad category

- **INVALID_ARGUMENT**: arguments passed to SDK method are not valid
- **NOT_SUPPORTED**: behavior or feature though possible is not currently supported by SDK
- **PROVIDER_ERROR**: error with RPC or Web3 Provider
- **READ_ERROR**: error while accessing Blockchain or External Resource for read
- **UNKNOWN_ERROR** error was not recognized by SDK and is not directly thrown by it's code

## `reason` — specific condition

Several distinct conditions share a single `code`, so `code` alone cannot tell
them apart. Where it matters, the SDK also sets `reason` — a stable
machine-readable string you can switch on, for example to map an SDK failure
onto your own error taxonomy or pick a specific message in a UI.

`reason` is optional: it is `undefined` for errors that have no more specific
condition to report. Each module owns its own vocabulary and exports it as a
typed union.

stVaults (`@lidofinance/lido-ethereum-sdk/stvault`, `VaultErrorReason`):

- **OWNER_NOT_DASHBOARD**: the vault's owner is not a Dashboard contract — its
  bytecode does not match the canonical Dashboard clone proxy
- **DASHBOARD_NOT_BELONG_TO_VAULT**: the address is a Dashboard, but its
  `stakingVault()` points at a different vault, so it does not control this one

```ts
import { VAULT_ERROR_REASON } from '@lidofinance/lido-ethereum-sdk/stvault';
import { SDKError } from '@lidofinance/lido-ethereum-sdk/common';

try {
  await vaultEntity.getDashboardAddress();
} catch (error) {
  if (error instanceof SDKError) {
    switch (error.reason) {
      case VAULT_ERROR_REASON.OWNER_NOT_DASHBOARD:
        // the owner is not a Dashboard at all
        break;
      case VAULT_ERROR_REASON.DASHBOARD_NOT_BELONG_TO_VAULT:
        // it is a Dashboard, but for a different vault
        break;
      default:
        // fall back to error.code
    }
  }
}
```

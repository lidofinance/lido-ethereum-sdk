import type { Address, Hex, TransactionReceipt } from 'viem';
import type { CommonTransactionProps } from '../core/types.js';

export type EarnVaultId = 'eth' | 'usd';
export type EarnEthDepositToken =
  | 'eth'
  | 'weth'
  | 'steth'
  | 'wsteth'
  | 'gg'
  | 'streth'
  | 'dvsteth';
export type EarnUsdDepositToken = 'usdc' | 'usdt' | 'usde';
export type EarnToken = EarnEthDepositToken | EarnUsdDepositToken;
export type EarnDepositToken<V extends EarnVaultId> = V extends 'eth'
  ? EarnEthDepositToken
  : EarnUsdDepositToken;
/** Tokens accepted by a deposit queue directly; stETH must be wrapped first. */
export type EarnQueueDepositToken<V extends EarnVaultId> = Exclude<
  EarnDepositToken<V>,
  'steth'
>;
/** ERC20 deposit tokens that need an allowance for their deposit queue. */
export type EarnApprovalToken<V extends EarnVaultId> = Exclude<
  EarnQueueDepositToken<V>,
  'eth'
>;
export type EarnWithdrawToken<V extends EarnVaultId> = V extends 'eth'
  ? 'wsteth'
  : 'usdc' | 'usdt';
export type EarnQueue = {
  readonly address: Address;
  readonly token: EarnToken;
  readonly kind: 'sync' | 'async';
  readonly legacy?: boolean;
};
export type EarnDeployment = {
  readonly chainId: number;
  readonly vault: Address;
  readonly collector: Address;
  readonly shareManager: Address;
  readonly baseAsset: EarnToken;
  readonly valuationToken: EarnToken;
  readonly tokens: Readonly<
    Partial<
      Record<
        EarnToken,
        { readonly address: Address; readonly decimals: number }
      >
    >
  >;
  readonly depositQueues: readonly EarnQueue[];
  readonly redeemQueues: readonly EarnQueue[];
};
export type EarnCollectorConfig = {
  baseAssetFallback: Address;
  oracleUpdateInterval: bigint;
  redeemHandlingInterval: bigint;
};
export type EarnReadOptions = { blockNumber?: bigint };
export type EarnStepKind =
  | 'approval-reset'
  | 'approve'
  | 'deposit'
  | 'cancel-deposit'
  | 'claim-deposit'
  | 'withdraw'
  | 'claim-withdrawal';
export type EarnStep = {
  kind: EarnStepKind;
  token?: EarnToken;
  queue?: Address;
  route?: 'sync' | 'async';
};
export type EarnDecodedResult = {
  /** Actual shares emitted by the sync deposit queue, absent for async deposits. */
  receivedShares?: bigint;
};
export type EarnTransactionProps = CommonTransactionProps & {
  /** Identifies the step before its transaction callbacks begin. */
  onStep?: (step: EarnStep) => void | Promise<void>;
};
export type EarnDepositProps<V extends EarnVaultId> = EarnTransactionProps & {
  token: EarnQueueDepositToken<V>;
  assets: bigint;
  referralAddress?: Address;
  merkleProof?: readonly Hex[];
};
export type EarnWithdrawProps<V extends EarnVaultId> = EarnTransactionProps & {
  token: EarnWithdrawToken<V>;
  shares: bigint;
  /** Auto preserves the widget's fallback on an unavailable/unknown sync route. */
  mode?: 'auto' | 'sync' | 'async';
};
export type EarnClaimProps<V extends EarnVaultId> = EarnTransactionProps & {
  token: EarnWithdrawToken<V>;
  timestamps: readonly bigint[];
};
export type EarnCancelProps = EarnTransactionProps & { queue: Address };
export type EarnDepositAllowance = {
  token: EarnToken;
  spender: Address;
  allowance: bigint;
  /** Allowance already covers the requested assets. */
  isSufficient: boolean;
  /** A zero-amount approval must be confirmed before approving the new amount. */
  requiresReset: boolean;
};
export type EarnAvailability =
  | {
      status: 'available';
      queue: Address;
      assets: bigint;
      remainingDailyLimit: bigint;
      liquidAssets: bigint;
    }
  | {
      status: 'unavailable';
      reason: 'no-sync-queue' | 'daily-limit' | 'liquidity';
    }
  | { status: 'unknown'; error: unknown };
export type EarnRequestIdentity = {
  chainId: number;
  vault: Address;
  queue: Address;
  asset: Address;
  token: EarnToken;
  account: Address;
};
export type EarnWithdrawalRequest = EarnRequestIdentity & {
  timestamp: bigint;
  shares: bigint;
  assets: bigint;
  isClaimable: boolean;
};
export type EarnDepositRequest = EarnRequestIdentity & {
  timestamp: bigint;
  assets: bigint;
  claimableShares: bigint;
  eta: bigint;
  isClaimable: boolean;
};
export type EarnReceiptDecoder = (
  receipt: TransactionReceipt,
  account: Address,
) => EarnDecodedResult;

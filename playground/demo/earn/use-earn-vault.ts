import type {
  EarnApprovalToken,
  EarnDepositToken,
  EarnDeployment,
  EarnQueue,
  EarnQueueDepositToken,
  EarnToken,
  EarnVaultId,
  EarnWithdrawToken,
  LidoSDKEarnVault,
} from '@lidofinance/lido-ethereum-sdk';
import { useLidoSDK } from 'providers/sdk';
import { useMemo } from 'react';

// Widen the vault so one demo component serves both EarnETH and EarnUSD.
export type AnyEarnVault = LidoSDKEarnVault<EarnVaultId>;

export type EarnVaultInfo = {
  vault: AnyEarnVault;
  deployment?: EarnDeployment;
  /** Tokens accepted by previewDeposit (stETH included on EarnETH). */
  previewTokens: EarnDepositToken<EarnVaultId>[];
  depositTokens: EarnQueueDepositToken<EarnVaultId>[];
  approvalTokens: EarnApprovalToken<EarnVaultId>[];
  withdrawTokens: EarnWithdrawToken<EarnVaultId>[];
  asyncDepositQueues: EarnQueue[];
  decimalsOf: (token: EarnToken) => number;
};

const unique = <T>(items: T[]) => [...new Set(items)];

export const useEarnVault = (id: EarnVaultId): EarnVaultInfo => {
  const { earn } = useLidoSDK();
  const vault = earn[id] as unknown as AnyEarnVault;

  return useMemo(() => {
    let deployment: EarnDeployment | undefined;
    try {
      deployment = vault.getDeployment();
    } catch {
      // Earn is deployed on mainnet only; other chains throw NOT_SUPPORTED.
      deployment = undefined;
    }
    const depositTokens = unique(
      (deployment?.depositQueues ?? [])
        .filter((q) => !q.legacy)
        .map((q) => q.token),
    ) as EarnQueueDepositToken<EarnVaultId>[];
    const previewTokens: EarnDepositToken<EarnVaultId>[] =
      deployment?.tokens.steth && id === 'eth'
        ? [...depositTokens, 'steth']
        : depositTokens;
    return {
      vault,
      deployment,
      previewTokens,
      depositTokens,
      approvalTokens: depositTokens.filter(
        (token): token is EarnApprovalToken<EarnVaultId> => token !== 'eth',
      ),
      withdrawTokens: unique(
        (deployment?.redeemQueues ?? [])
          .filter((q) => q.kind === 'async')
          .map((q) => q.token),
      ) as EarnWithdrawToken<EarnVaultId>[],
      asyncDepositQueues: (deployment?.depositQueues ?? []).filter(
        (q) => q.kind === 'async',
      ),
      decimalsOf: (token) => deployment?.tokens[token]?.decimals ?? 18,
    };
  }, [vault, id]);
};

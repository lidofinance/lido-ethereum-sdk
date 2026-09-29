import { Accordion, Option, Select } from '@lidofinance/lido-ui';
import { useWeb3 } from 'reef-knot/web3-react';
import type {
  EarnApprovalToken,
  EarnDepositToken,
  EarnVaultId,
  EarnWithdrawToken,
} from '@lidofinance/lido-ethereum-sdk';
import { useState } from 'react';
import { zeroAddress, type Address } from 'viem';
import { Action } from 'components/action';
import TokenInput, { ValueType } from 'components/tokenInput';
import {
  QueueSelect,
  renderUnits,
  SHARES_DECIMALS,
  TokenSelect,
} from './controls';
import type { EarnVaultInfo } from './use-earn-vault';

const ZERO = BigInt(0);

type EarnReadsProps = { title: string; info: EarnVaultInfo };

export const EarnReadsDemo = ({ title, info }: EarnReadsProps) => {
  const { account: web3account = '0x0' } = useWeb3();
  const account = web3account as Address;
  const {
    vault,
    previewTokens,
    approvalTokens,
    withdrawTokens,
    asyncDepositQueues,
    decimalsOf,
  } = info;

  const [previewToken, setPreviewToken] = useState<
    EarnDepositToken<EarnVaultId>
  >(previewTokens[0] ?? 'eth');
  const [previewAssets, setPreviewAssets] = useState<ValueType>(null);
  const [allowanceToken, setAllowanceToken] = useState<
    EarnApprovalToken<EarnVaultId>
  >(approvalTokens[0] ?? 'wsteth');
  const [allowanceAssets, setAllowanceAssets] = useState<ValueType>(null);
  const [withdrawToken, setWithdrawToken] = useState<
    EarnWithdrawToken<EarnVaultId>
  >(withdrawTokens[0] ?? 'wsteth');
  const [withdrawShares, setWithdrawShares] = useState<ValueType>(null);
  const [previewMode, setPreviewMode] = useState<'sync' | 'async'>('async');
  const [queue, setQueue] = useState<Address | undefined>(
    asyncDepositQueues[0]?.address,
  );
  const [stethValue, setStethValue] = useState<ValueType>(null);

  return (
    <Accordion summary={`${title} reads`}>
      <Action title="Get deployment" action={() => vault.getDeployment()} />
      <Action title="Get capabilities" action={() => vault.getCapabilities()} />
      <Action title="Collect (vault-level)" action={() => vault.collect()} />
      <Action
        title="Collect (connected account)"
        walletAction
        action={() => vault.collect(account)}
      />
      <Action
        title="Balance (shares)"
        walletAction
        renderResult={renderUnits(SHARES_DECIMALS, 'shares')}
        action={() => vault.balance(account)}
      />
      <Action
        title="Get position"
        walletAction
        action={() => vault.getPosition(account)}
      />
      <Action title="Get fees" action={() => vault.getFees()} />

      {vault.id === 'eth' && (
        <Action
          title="Convert stETH -> wstETH"
          renderResult={renderUnits(18, 'wstETH')}
          action={() => vault.convertStethToWsteth(stethValue ?? ZERO)}
        >
          <TokenInput
            label="stETH"
            value={stethValue}
            placeholder="0.0"
            onChange={setStethValue}
          />
        </Action>
      )}

      <Action
        title={`Preview deposit ${previewToken}`}
        action={() =>
          vault.previewDeposit({
            token: previewToken,
            assets: previewAssets ?? ZERO,
            // Zero address gives a generic, account-independent preview.
            account: account === '0x0' ? zeroAddress : account,
          })
        }
      >
        <TokenSelect
          tokens={previewTokens}
          value={previewToken}
          onChange={(token) => {
            setPreviewToken(token);
            setPreviewAssets(null);
          }}
        />
        <TokenInput
          label={`assets (${decimalsOf(previewToken)} decimals)`}
          decimals={decimalsOf(previewToken)}
          value={previewAssets}
          placeholder="0.0"
          onChange={setPreviewAssets}
        />
      </Action>

      <Action
        title={`Get deposit allowance ${allowanceToken}`}
        walletAction
        action={() =>
          vault.getDepositAllowance({
            token: allowanceToken,
            account,
            assets: allowanceAssets ?? ZERO,
          })
        }
      >
        <TokenSelect
          tokens={approvalTokens}
          value={allowanceToken}
          onChange={(token) => {
            setAllowanceToken(token);
            setAllowanceAssets(null);
          }}
        />
        <TokenInput
          label={`assets to deposit (${decimalsOf(allowanceToken)} decimals)`}
          decimals={decimalsOf(allowanceToken)}
          value={allowanceAssets}
          placeholder="0.0"
          onChange={setAllowanceAssets}
        />
      </Action>

      <Action
        title={`Preview withdraw to ${withdrawToken} (${previewMode})`}
        action={() =>
          vault.previewWithdraw({
            token: withdrawToken,
            shares: withdrawShares ?? ZERO,
            mode: previewMode,
          })
        }
      >
        <TokenSelect
          label="payout token"
          tokens={withdrawTokens}
          value={withdrawToken}
          onChange={setWithdrawToken}
        />
        <Select
          label="mode"
          value={previewMode}
          onChange={(mode) => setPreviewMode(mode as 'sync' | 'async')}
        >
          <Option value="async">async</Option>
          <Option value="sync">sync</Option>
        </Select>
        <TokenInput
          label="shares"
          value={withdrawShares}
          placeholder="0.0"
          onChange={setWithdrawShares}
        />
      </Action>
      <Action
        title={`Get instant withdraw availability to ${withdrawToken}`}
        action={() =>
          vault.getWithdrawAvailability({
            token: withdrawToken,
            shares: withdrawShares ?? ZERO,
          })
        }
      />

      <Action
        title="Get deposit requests"
        walletAction
        action={() => vault.getDepositRequests(account)}
      />
      <Action
        title="Get deposit queue request"
        walletAction
        action={() => {
          if (!queue) throw new Error('No async deposit queue selected');
          return vault.getDepositQueueRequest({ queue, account });
        }}
      >
        <QueueSelect
          queues={asyncDepositQueues}
          value={queue}
          onChange={setQueue}
        />
      </Action>
      <Action
        title={`Get all withdrawal requests (${withdrawToken})`}
        walletAction
        action={() =>
          vault.getAllWithdrawalRequests({ token: withdrawToken, account })
        }
      />
    </Accordion>
  );
};

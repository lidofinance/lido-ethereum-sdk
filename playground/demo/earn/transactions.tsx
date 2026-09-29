import {
  Accordion,
  Checkbox,
  Input,
  Option,
  Select,
} from '@lidofinance/lido-ui';
import { useWeb3 } from 'reef-knot/web3-react';
import type {
  EarnApprovalToken,
  EarnQueueDepositToken,
  EarnVaultId,
  EarnWithdrawalRequest,
  EarnWithdrawToken,
} from '@lidofinance/lido-ethereum-sdk';
import { useState } from 'react';
import { formatUnits, type Address } from 'viem';
import { Action } from 'components/action';
import { RequestsWrapper } from 'components/requestsWrapper';
import TokenInput, { ValueType } from 'components/tokenInput';
import { transactionToast } from 'utils/transaction-toast';
import {
  parseProof,
  QueueSelect,
  ReferralInput,
  SHARES_DECIMALS,
  TokenSelect,
} from './controls';
import type { EarnVaultInfo } from './use-earn-vault';

const ZERO = BigInt(0);
type WithdrawMode = 'auto' | 'sync' | 'async';

type EarnTransactionsProps = { title: string; info: EarnVaultInfo };

export const EarnTransactionsDemo = ({
  title,
  info,
}: EarnTransactionsProps) => {
  const { account: web3account = '0x0' } = useWeb3();
  const account = web3account as Address;
  const {
    vault,
    depositTokens,
    approvalTokens,
    withdrawTokens,
    asyncDepositQueues,
    decimalsOf,
  } = info;

  // Approval
  const [approvalToken, setApprovalToken] = useState<
    EarnApprovalToken<EarnVaultId>
  >(approvalTokens[0] ?? 'wsteth');
  const [approvalAssets, setApprovalAssets] = useState<ValueType>(null);
  const approvalProps = {
    token: approvalToken,
    assets: approvalAssets ?? ZERO,
  };

  // Deposit
  const [depositToken, setDepositToken] = useState<
    EarnQueueDepositToken<EarnVaultId>
  >(depositTokens[0] ?? 'eth');
  const [depositAssets, setDepositAssets] = useState<ValueType>(null);
  const [referral, setReferral] = useState('');
  const [proof, setProof] = useState('');
  const depositProps = {
    token: depositToken,
    assets: depositAssets ?? ZERO,
    referralAddress: referral ? (referral as Address) : undefined,
    merkleProof: parseProof(proof),
    account,
  };

  // Withdraw
  const [withdrawToken, setWithdrawToken] = useState<
    EarnWithdrawToken<EarnVaultId>
  >(withdrawTokens[0] ?? 'wsteth');
  const [withdrawShares, setWithdrawShares] = useState<ValueType>(null);
  const [mode, setMode] = useState<WithdrawMode>('auto');
  const withdrawProps = {
    token: withdrawToken,
    shares: withdrawShares ?? ZERO,
    mode,
    account,
  };

  // Cancel deposit request
  const [cancelQueue, setCancelQueue] = useState<Address | undefined>(
    asyncDepositQueues[0]?.address,
  );
  const cancelProps = () => {
    if (!cancelQueue) throw new Error('No async deposit queue selected');
    return { queue: cancelQueue, account };
  };

  // Claim withdrawals
  const [claimToken, setClaimToken] = useState<EarnWithdrawToken<EarnVaultId>>(
    withdrawTokens[0] ?? 'wsteth',
  );
  const [requests, setRequests] = useState<EarnWithdrawalRequest[]>([]);
  const [selected, setSelected] = useState<bigint[]>([]);
  const claimProps = { token: claimToken, timestamps: selected, account };
  const toggleSelected = (timestamp: bigint) =>
    setSelected((current) =>
      current.includes(timestamp)
        ? current.filter((item) => item !== timestamp)
        : [...current, timestamp],
    );

  return (
    <Accordion summary={`${title} transactions`}>
      {/* Deposit approval */}
      <Action
        title={`Approve ${approvalToken} for deposit`}
        walletAction
        action={async () =>
          (await vault.prepareDepositApproval(approvalProps)).send({
            account,
            callback: transactionToast,
          })
        }
      >
        <TokenSelect
          tokens={approvalTokens}
          value={approvalToken}
          onChange={(token) => {
            setApprovalToken(token);
            setApprovalAssets(null);
          }}
        />
        <TokenInput
          label={`assets (${decimalsOf(approvalToken)} decimals, 0 resets)`}
          decimals={decimalsOf(approvalToken)}
          value={approvalAssets}
          placeholder="0.0"
          onChange={setApprovalAssets}
        />
      </Action>
      <Action
        title="Approve Populate"
        walletAction
        action={async () =>
          (await vault.prepareDepositApproval(approvalProps)).populate({
            account,
          })
        }
      />
      <Action
        title="Approve Estimate Gas"
        walletAction
        action={async () =>
          (await vault.prepareDepositApproval(approvalProps)).estimateGas({
            account,
          })
        }
      />
      <Action
        title="Approve Simulate"
        walletAction
        action={async () =>
          (await vault.prepareDepositApproval(approvalProps)).simulate({
            account,
          })
        }
      />

      {/* Deposit */}
      <Action
        title={`Deposit ${depositToken} to queue`}
        walletAction
        action={() =>
          vault.depositToQueue({ ...depositProps, callback: transactionToast })
        }
      >
        <TokenSelect
          tokens={depositTokens}
          value={depositToken}
          onChange={(token) => {
            setDepositToken(token);
            setDepositAssets(null);
          }}
        />
        <TokenInput
          label={`assets (${decimalsOf(depositToken)} decimals)`}
          decimals={decimalsOf(depositToken)}
          value={depositAssets}
          placeholder="0.0"
          onChange={setDepositAssets}
        />
        <ReferralInput value={referral} onChange={setReferral} />
        <Input
          label="merkle proof (optional, comma separated bytes32)"
          placeholder="0x…, 0x…"
          value={proof}
          onChange={(e) => setProof(e.currentTarget.value)}
        />
      </Action>
      <Action
        title="Deposit Populate"
        walletAction
        action={() => vault.depositToQueuePopulateTx(depositProps)}
      />
      <Action
        title="Deposit Estimate Gas"
        walletAction
        action={() => vault.depositToQueueEstimateGas(depositProps)}
      />
      <Action
        title="Deposit Simulate"
        walletAction
        action={() => vault.depositToQueueSimulateTx(depositProps)}
      />

      {/* Withdraw */}
      <Action
        title={`Withdraw to ${withdrawToken} (${mode})`}
        walletAction
        action={() =>
          vault.withdraw({ ...withdrawProps, callback: transactionToast })
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
          value={mode}
          onChange={(value) => setMode(value as WithdrawMode)}
        >
          <Option value="auto">auto</Option>
          <Option value="sync">sync</Option>
          <Option value="async">async</Option>
        </Select>
        <TokenInput
          label="shares"
          value={withdrawShares}
          placeholder="0.0"
          onChange={setWithdrawShares}
        />
      </Action>
      <Action
        title="Prepare withdraw (selected route)"
        walletAction
        action={async () => (await vault.prepareWithdraw(withdrawProps)).step}
      />
      <Action
        title="Withdraw Populate"
        walletAction
        action={() => vault.withdrawPopulateTx(withdrawProps)}
      />
      <Action
        title="Withdraw Estimate Gas"
        walletAction
        action={() => vault.withdrawEstimateGas(withdrawProps)}
      />
      <Action
        title="Withdraw Simulate"
        walletAction
        action={() => vault.withdrawSimulateTx(withdrawProps)}
      />

      {/* Cancel async deposit request */}
      <Action
        title="Cancel deposit request"
        walletAction
        action={() =>
          vault.cancelDepositRequest({
            ...cancelProps(),
            callback: transactionToast,
          })
        }
      >
        <QueueSelect
          queues={asyncDepositQueues}
          value={cancelQueue}
          onChange={setCancelQueue}
        />
      </Action>
      <Action
        title="Cancel deposit request Populate"
        walletAction
        action={() => vault.cancelDepositRequestPopulateTx(cancelProps())}
      />
      <Action
        title="Cancel deposit request Simulate"
        walletAction
        action={() => vault.cancelDepositRequestSimulateTx(cancelProps())}
      />

      {/* Claim deposit shares */}
      <Action
        title="Claim deposit shares"
        walletAction
        action={() =>
          vault.claimDepositShares({ account, callback: transactionToast })
        }
      />
      <Action
        title="Claim deposit shares Populate"
        walletAction
        action={() => vault.claimDepositSharesPopulateTx({ account })}
      />
      <Action
        title="Claim deposit shares Simulate"
        walletAction
        action={() => vault.claimDepositSharesSimulateTx({ account })}
      />

      {/* Claim withdrawals */}
      <Action
        title={`Load ${claimToken} withdrawal requests`}
        walletAction
        action={async () => {
          const result = await vault.getAllWithdrawalRequests({
            token: claimToken,
            account,
          });
          setRequests(result);
          setSelected([]);
          return result;
        }}
      >
        <TokenSelect
          label="payout token"
          tokens={withdrawTokens}
          value={claimToken}
          onChange={(token) => {
            setClaimToken(token);
            setRequests([]);
            setSelected([]);
          }}
        />
      </Action>
      <Action
        title="Claim selected withdrawals"
        walletAction
        action={async () => {
          const result = await vault.claimWithdrawals({
            ...claimProps,
            callback: transactionToast,
          });
          setSelected([]);
          return result;
        }}
      >
        <RequestsWrapper>
          {requests.map((request) => (
            <Checkbox
              key={request.timestamp.toString()}
              checked={selected.includes(request.timestamp)}
              label={`${request.timestamp} — ${formatUnits(
                request.shares,
                SHARES_DECIMALS,
              )} shares, ${formatUnits(
                request.assets,
                decimalsOf(claimToken),
              )} ${claimToken}${request.isClaimable ? '' : ' (pending)'}`}
              onChange={() => toggleSelected(request.timestamp)}
            />
          ))}
        </RequestsWrapper>
      </Action>
      <Action
        title="Claim selected withdrawals Populate"
        walletAction
        action={() => vault.claimWithdrawalsPopulateTx(claimProps)}
      />
      <Action
        title="Claim selected withdrawals Simulate"
        walletAction
        action={() => vault.claimWithdrawalsSimulateTx(claimProps)}
      />
    </Accordion>
  );
};

import { Input, Accordion } from '@lidofinance/lido-ui';
import { useWeb3 } from '@reef-knot/web3-react';
import { Action, renderTokenResult } from 'components/action';
import { DEFAULT_VALUE, ValueType } from 'components/tokenInput';
import TokenInput from 'components/tokenInput/tokenInput';
import { useAddressState } from 'hooks/useAddressState';
import { useLidoSDK } from 'providers/sdk';
import { useState } from 'react';
import { transactionToast } from 'utils/transaction-toast';
import { type Address } from 'viem';

export const ShareDemo = () => {
  const { shares } = useLidoSDK();
  const { account: web3account = '0x0' } = useWeb3();
  const [transferAmountState, setTransferAmount] =
    useState<ValueType>(DEFAULT_VALUE);
  const transferAmount = transferAmountState ?? BigInt(0);
  const [toTransfer, setToTransfer] = useAddressState();
  const [fromTransfer, setFromTransfer] = useAddressState('' as Address);
  const account = web3account as Address;

  // convert
  const [stethAmount, setStethAmount] = useState<ValueType>(DEFAULT_VALUE);
  const [sharesAmount, setSharesAmount] = useState<ValueType>(DEFAULT_VALUE);

  return (
    <Accordion summary={'Shares'}>
      <Action
        walletAction
        title="Balance Shares"
        action={() => shares.balance(account)}
        renderResult={renderTokenResult('shares')}
      />
      <Action
        walletAction
        title="Transfer"
        action={() =>
          shares.transfer({
            account,
            amount: transferAmount,
            to: toTransfer,
            from: fromTransfer ? fromTransfer : undefined,
            callback: transactionToast,
          })
        }
      >
        <TokenInput
          label="amount"
          value={transferAmountState}
          placeholder="0.0"
          onChange={setTransferAmount}
        />
        <Input
          label="To address"
          placeholder="0x0000000"
          value={toTransfer}
          onChange={(e) => setToTransfer(e.currentTarget.value as Address)}
        />
        <Input
          label="From address(optional)"
          placeholder="0x0000000"
          value={fromTransfer}
          onChange={(e) => setFromTransfer(e.currentTarget.value as Address)}
        />
      </Action>
      <Action
        walletAction
        title="Simulate Transfer"
        action={() =>
          shares.simulateTransfer({
            account,
            amount: transferAmount,
            to: toTransfer,
            from: fromTransfer ? fromTransfer : undefined,
          })
        }
      />
      <Action
        walletAction
        title="Populate Transfer"
        action={() =>
          shares.populateTransfer({
            account,
            amount: transferAmount,
            to: toTransfer,
            from: fromTransfer ? fromTransfer : undefined,
          })
        }
      />
      <Action title="Total supply" action={() => shares.getTotalSupply()} />
      <Action title="Share Rate" action={() => shares.getShareRate()} />
      <Action
        title="Convert shares -> stETH"
        action={() => shares.convertToSteth(sharesAmount ?? '0')}
        renderResult={renderTokenResult('stETH')}
      >
        <TokenInput
          label="shares"
          value={sharesAmount}
          placeholder="0.0"
          onChange={setSharesAmount}
        />
      </Action>
      <Action
        title="Convert stETH -> shares"
        action={() => shares.convertToShares(stethAmount ?? '0')}
        renderResult={renderTokenResult('share')}
      >
        <TokenInput
          label="shares"
          value={stethAmount}
          placeholder="0.0"
          onChange={setStethAmount}
        />
      </Action>
    </Accordion>
  );
};

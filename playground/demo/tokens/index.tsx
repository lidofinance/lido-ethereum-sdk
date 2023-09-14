import { AbstractLidoSDKErc20 } from '@lidofinance/lido-ethereum-sdk/dist/types/erc20';
import { Input, Accordion } from '@lidofinance/lido-ui';
import { useWeb3 } from '@reef-knot/web3-react';
import { Action, renderTokenResult } from 'components/action';
import { DEFAULT_VALUE, ValueType } from 'components/tokenInput';
import TokenInput from 'components/tokenInput/tokenInput';
import { useLidoSDK } from 'providers/sdk';
import { useState } from 'react';
import { transactionToast } from 'utils/transaction-toast';
import { type Address } from 'viem';

type TokenDemoProps = {
  instance: AbstractLidoSDKErc20;
  name: string;
};

export const StethDemo = () => {
  const { steth } = useLidoSDK();
  return <TokenDemo name="stETH" instance={steth} />;
};

export const WstethDemo = () => {
  const { wsteth } = useLidoSDK();
  return <TokenDemo name="wstETH" instance={wsteth} />;
};

const TokenDemo = ({ instance, name }: TokenDemoProps) => {
  const { account: web3account = '0x0' } = useWeb3();
  const [transferAmountState, setTransferAmount] =
    useState<ValueType>(DEFAULT_VALUE);
  const transferAmount = transferAmountState ?? BigInt(0);
  const [toTransfer, setToTransfer] = useState<Address>('0x0' as Address);
  const [fromTransfer, setFromTransfer] = useState<Address>('' as Address);
  const account = web3account as Address;

  // Approve
  const [approveAmountState, setApproveAmount] =
    useState<ValueType>(DEFAULT_VALUE);
  const approveAmount = approveAmountState ?? BigInt(0);
  const [toApprove, setToApprove] = useState<Address>('0x0' as Address);

  // Permit
  const [permitAmountState, setPermitAmount] =
    useState<ValueType>(DEFAULT_VALUE);
  const permitAmount = permitAmountState ?? BigInt(0);
  const [toPermit, setToPermit] = useState<Address>('0x0' as Address);

  return (
    <Accordion summary={name}>
      <Action
        title="Balance"
        action={() => instance.balance(account)}
        renderResult={renderTokenResult(name)}
      />
      <Action
        title="Transfer"
        action={() =>
          instance.transfer({
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
        title="Approve"
        action={() =>
          instance.approve({ account, amount: approveAmount, to: toApprove })
        }
      >
        <TokenInput
          label="amount"
          value={approveAmountState}
          placeholder="0.0"
          onChange={setApproveAmount}
        />
        <Input
          label="To address"
          placeholder="0x0000000"
          value={toApprove}
          onChange={(e) => setToApprove(e.currentTarget.value as Address)}
        />
      </Action>
      <Action
        title="Allowance"
        action={() => instance.allowance({ account, to: toApprove })}
        renderResult={renderTokenResult(name)}
      />
      <Action title="ERC 721 Domain" action={() => instance.erc721Domain()} />
      <Action title="Permit nonces" action={() => instance.nonces(account)} />
      <Action
        title="Permit"
        action={() =>
          instance.signPermit({
            account,
            amount: permitAmount,
            spender: toPermit,
          })
        }
      >
        <TokenInput
          label="permit amount"
          value={permitAmountState}
          placeholder="0.0"
          onChange={setPermitAmount}
        />
        <Input
          label="To address"
          placeholder="0x0000000"
          value={toPermit}
          onChange={(e) => setToPermit(e.currentTarget.value as Address)}
        />
      </Action>
      <Action title="Token Metadata" action={() => instance.erc20Metadata()} />
      <Action
        title="Total Supply"
        action={() => instance.totalSupply()}
        renderResult={renderTokenResult(name)}
      />

      <Action
        title="Contract Address"
        action={() => instance.contractAddress()}
      />
    </Accordion>
  );
};

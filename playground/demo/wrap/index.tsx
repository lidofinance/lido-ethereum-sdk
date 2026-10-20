import { Input } from '@lidofinance/lido-ui';
import { useWeb3 } from 'reef-knot/web3-react';
import { Action, renderTokenResult } from 'components/action';
import { ActionGroup, ModuleSection } from 'components/module-section';
import { DEFAULT_VALUE, ValueType } from 'components/tokenInput';
import TokenInput from 'components/tokenInput/tokenInput';
import { useLidoSDK } from 'providers/sdk';
import { useState } from 'react';
import { transactionToast } from 'utils/transaction-toast';

const ZERO = BigInt(0);

export const WrapDemo = () => {
  const { account: web3account = '0x0' } = useWeb3();
  const [wrapValue, setWrapValue] = useState<ValueType>(DEFAULT_VALUE);
  const [referralAddressState, setReferralAddress] = useState<string>('');
  const [approveValue, setApproveValue] = useState<ValueType>(DEFAULT_VALUE);
  const [wrapStethValue, setWrapStethValue] =
    useState<ValueType>(DEFAULT_VALUE);
  const [unwrapValue, setUnwrapValue] = useState<ValueType>(DEFAULT_VALUE);

  const [stethValue, setStethValue] = useState<ValueType>(DEFAULT_VALUE);
  const [wstethValue, setWstethValue] = useState<ValueType>(DEFAULT_VALUE);

  const { wrap } = useLidoSDK();

  const account = web3account as `0x{string}`;
  const referralAddress = referralAddressState
    ? (referralAddressState as `0x{string}`)
    : undefined;

  return (
    <ModuleSection title="Wrap" description="sdk.wrap">
      <ActionGroup
        title="Wrap ETH"
        params={
          <>
            <TokenInput
              label="value"
              value={wrapValue}
              placeholder="0.0"
              onChange={setWrapValue}
            />
            <Input
              label="referral address"
              placeholder="0x0000000"
              value={referralAddressState}
              onChange={(e) => setReferralAddress(e.currentTarget.value)}
            />
          </>
        }
      >
        <Action
          walletAction
          title="Wrap ETH"
          method="wrapEth"
          action={() =>
            wrap.wrapEth({
              value: wrapValue ?? ZERO,
              referralAddress: referralAddress,
              account,
              callback: transactionToast,
            })
          }
        />
        <Action
          title="Wrap ETH Populate"
          method="wrapEthPopulateTx"
          walletAction
          action={() =>
            wrap.wrapEthPopulateTx({
              value: wrapValue ?? ZERO,
              referralAddress: referralAddress,
              account,
            })
          }
        />
        <Action
          title="Wrap ETH Estimate Gas(simulate)"
          method="wrapEthEstimateGas"
          walletAction
          action={() =>
            wrap.wrapEthEstimateGas({
              value: wrapValue ?? ZERO,
              referralAddress: referralAddress,
              account,
            })
          }
        />
      </ActionGroup>

      <ActionGroup
        title="Approve stETH for wrap"
        params={
          <TokenInput
            label="value"
            value={approveValue}
            placeholder="0.0"
            onChange={setApproveValue}
          />
        }
      >
        <Action
          title="Get Approved stETH for Wrap"
          method="getStethForWrapAllowance"
          walletAction
          renderResult={renderTokenResult('stETH')}
          action={() => wrap.getStethForWrapAllowance(account)}
        />
        <Action
          walletAction
          title="Approve stETH For Wrap"
          method="approveStethForWrap"
          action={() =>
            wrap.approveStethForWrap({
              value: approveValue ?? ZERO,
              account,
              callback: transactionToast,
            })
          }
        />
        <Action
          title="Approve stETH For Wrap Populate"
          method="approveStethForWrapPopulateTx"
          walletAction
          action={() =>
            wrap.approveStethForWrapPopulateTx({
              value: approveValue ?? ZERO,
              account,
            })
          }
        />
        <Action
          title="Approve stETH For Wrap Simulate"
          method="approveStethForWrapSimulateTx"
          walletAction
          action={() =>
            wrap.approveStethForWrapSimulateTx({
              value: approveValue ?? ZERO,
              account,
            })
          }
        />
      </ActionGroup>

      <ActionGroup
        title="Wrap stETH"
        params={
          <TokenInput
            label="value"
            value={wrapStethValue}
            placeholder="0.0"
            onChange={setWrapStethValue}
          />
        }
      >
        <Action
          walletAction
          title="Wrap stETH"
          method="wrapSteth"
          action={() =>
            wrap.wrapSteth({
              value: wrapStethValue ?? ZERO,
              account,
              callback: transactionToast,
            })
          }
        />
        <Action
          title="Populate Wrap stETH"
          method="wrapStethPopulateTx"
          walletAction
          action={() =>
            wrap.wrapStethPopulateTx({
              value: wrapStethValue ?? ZERO,
              account,
            })
          }
        />
        <Action
          title="Simulate Wrap stETH"
          method="wrapStethSimulateTx"
          walletAction
          action={() =>
            wrap.wrapStethSimulateTx({
              value: wrapStethValue ?? ZERO,
              account,
            })
          }
        />
      </ActionGroup>

      <ActionGroup
        title="Unwrap wstETH"
        params={
          <TokenInput
            label="value"
            value={unwrapValue}
            placeholder="0.0"
            onChange={setUnwrapValue}
          />
        }
      >
        <Action
          walletAction
          title="Unwrap wstETH"
          method="unwrap"
          action={() =>
            wrap.unwrap({
              value: unwrapValue ?? ZERO,
              account,
              callback: transactionToast,
            })
          }
        />
        <Action
          title="Populate unwrap"
          method="unwrapPopulateTx"
          walletAction
          action={() =>
            wrap.unwrapPopulateTx({
              value: unwrapValue ?? ZERO,
              account,
            })
          }
        />
        <Action
          title="Simulate unwrap"
          method="unwrapSimulateTx"
          walletAction
          action={() =>
            wrap.unwrapSimulateTx({
              value: unwrapValue ?? ZERO,
              account,
            })
          }
        />
      </ActionGroup>

      <ActionGroup title="Conversions">
        <Action
          title="Convert wstETH->stETH"
          method="convertWstethToSteth"
          action={() => wrap.convertWstethToSteth(wstethValue ?? ZERO)}
          renderResult={renderTokenResult('stETH')}
        >
          <TokenInput
            label="wstETH"
            value={wstethValue}
            placeholder="0.0"
            onChange={setWstethValue}
          />
        </Action>
        <Action
          title="Convert stETH->wstETH"
          method="convertStethToWsteth"
          action={() => wrap.convertStethToWsteth(stethValue ?? ZERO)}
          renderResult={renderTokenResult('wstETH')}
        >
          <TokenInput
            label="stETH"
            value={stethValue}
            placeholder="0.0"
            onChange={setStethValue}
          />
        </Action>
      </ActionGroup>
    </ModuleSection>
  );
};

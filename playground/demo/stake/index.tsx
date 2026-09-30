import { Input } from '@lidofinance/lido-ui';
import { useWeb3 } from 'reef-knot/web3-react';
import { Action } from 'components/action';
import { ActionGroup, ModuleSection } from 'components/module-section';
import { DEFAULT_VALUE, ValueType } from 'components/tokenInput';
import TokenInput from 'components/tokenInput/tokenInput';
import { useLidoSDK } from 'providers/sdk';
import { useState } from 'react';
import { transactionToast } from 'utils/transaction-toast';

export const StakeDemo = () => {
  const { account: web3account = '0x0' } = useWeb3();
  const [stakingValueState, setStakingValue] =
    useState<ValueType>(DEFAULT_VALUE);
  const stakingValue = stakingValueState ?? BigInt(0);
  const [referralAddressState, setReferralAddress] = useState('');
  const { stake } = useLidoSDK();

  const account = web3account as `0x{string}`;
  const referralAddress = referralAddressState
    ? (referralAddressState as `0x{string}`)
    : undefined;

  return (
    <ModuleSection title="Staking" description="sdk.stake">
      <ActionGroup
        title="Stake ETH"
        params={
          <>
            <TokenInput
              label="value"
              value={stakingValue}
              placeholder="0.0"
              onChange={setStakingValue}
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
          title="Stake"
          method="stakeEth"
          walletAction
          action={() =>
            stake.stakeEth({
              value: stakingValue,
              account,
              referralAddress,
              callback: transactionToast,
            })
          }
        />
        <Action
          title="Stake Populate TX"
          method="stakeEthPopulateTx"
          walletAction
          action={() =>
            stake.stakeEthPopulateTx({
              account,
              value: stakingValue,
              referralAddress,
            })
          }
        />
        <Action
          title="Stake Simulate Tx"
          method="stakeEthSimulateTx"
          walletAction
          action={() =>
            stake.stakeEthSimulateTx({
              account,
              value: stakingValue,
              referralAddress,
            })
          }
        />
      </ActionGroup>
      <ActionGroup title="Views">
        <Action
          title="Stake Limit"
          method="getStakeLimitInfo"
          action={() => stake.getStakeLimitInfo()}
        />
        <Action
          title="Address stETH"
          method="contractAddressStETH"
          action={() => stake.contractAddressStETH()}
        />
        <Action
          title="Get Contract stETH ABI"
          method="getContractStETH().abi"
          action={async () => (await stake.getContractStETH()).abi}
        />
      </ActionGroup>
    </ModuleSection>
  );
};

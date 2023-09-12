import { Input, Accordion } from '@lidofinance/lido-ui';
import { useWeb3 } from '@reef-knot/web3-react';
import { Action, renderTokenResult } from 'components/action';
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
  const { staking } = useLidoSDK();

  const account = web3account as `0x{string}`;
  const referralAddress = referralAddressState
    ? (referralAddressState as `0x{string}`)
    : undefined;

  return (
    <Accordion summary="Staking">
      <Action
        title="Stake"
        action={() =>
          staking.stake({
            value: stakingValue,
            account,
            callback: transactionToast,
          })
        }
      >
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
      </Action>
      <Action
        title="Stake Populate TX"
        action={() =>
          staking.stakePopulateTx({
            account,
            value: stakingValue,
            referralAddress,
          })
        }
      />
      <Action
        title="Stake Simulate Tx"
        action={() =>
          staking.stakeSimulateTx({
            account,
            value: stakingValue,
            referralAddress,
          })
        }
      />
      <Action
        title="Balance StETH"
        action={() => staking.balanceStETH(account)}
        renderResult={renderTokenResult('stETH')}
      />
      <Action title="Stake Limit" action={() => staking.getStakeLimitInfo()} />
      <Action
        title="Address Steth"
        action={() => staking.contractAddressStETH()}
      />
      <Action
        title="Get Contract Steth ABI"
        action={async () => (await staking.getContractStETH()).abi}
      />
    </Accordion>
  );
};

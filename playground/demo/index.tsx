import { CoreDemo } from './core';
import { StakeDemo } from './stake';
import { WrapDemo } from './wrap';
import {
  WithdrawalsRequestDemo,
  WithdrawalsViewsDemo,
  WithdrawalsClaimDemo,
  WithdrawalsContractDemo,
} from './withdrawals';
import { StethDemo, WstethDemo } from './tokens';
import { UnstethDemo } from './unsteth';
import { EventsDemo } from './events';
import { StatisticsDemo } from './statistics';
import { RewardsDemo } from './rewards';
import { ShareDemo } from './shares';
import { DualGovernanceDemo } from './dual-governance';
import { useChainId } from 'wagmi';
import { L2_CHAINS } from 'providers/web3';
import { L2 } from './l2';
import { StVaultDemo } from './stvault';

export const Demo = () => {
  const chain = useChainId();
  if (L2_CHAINS.includes(chain)) return <L2 />;
  return (
    <>
      <StVaultDemo />
      <StakeDemo />
      <WrapDemo />
      <CoreDemo />
      <WithdrawalsRequestDemo />
      <WithdrawalsClaimDemo />
      <WithdrawalsViewsDemo />
      <WithdrawalsContractDemo />
      <StethDemo />
      <WstethDemo />
      <UnstethDemo />
      <ShareDemo />
      <EventsDemo />
      <StatisticsDemo />
      <RewardsDemo />
      <DualGovernanceDemo />
    </>
  );
};

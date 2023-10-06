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

export const Demo = () => {
  return (
    <>
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
      <EventsDemo />
      <StatisticsDemo />
    </>
  );
};

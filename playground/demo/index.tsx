import { CoreDemo } from './core';
import { StakeDemo } from './stake';
import { WrapDemo } from './wrap';
import {
  WithdrawalsRequestDemo,
  WithdrawalsViewsDemo,
  WithdrawalsClaimDemo,
} from './withdrawals';
import { StethDemo, WstethDemo } from './tokens';
import { UnstethDemo } from './unsteth';

export const Demo = () => {
  return (
    <>
      <StakeDemo />
      <WrapDemo />
      <CoreDemo />
      <WithdrawalsRequestDemo />
      <WithdrawalsClaimDemo />
      <WithdrawalsViewsDemo />
      <StethDemo />
      <WstethDemo />
      <UnstethDemo />
    </>
  );
};

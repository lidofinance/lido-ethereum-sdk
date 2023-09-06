import { CoreDemo } from './core';
import { StakeDemo } from './stake';
import { WithdrawalsRequestDemo, WithdrawalsViewsDemo } from './withdrawals';

export const Demo = () => {
  return (
    <>
      <StakeDemo />
      <CoreDemo />
      <WithdrawalsRequestDemo />
      <WithdrawalsViewsDemo />
    </>
  );
};

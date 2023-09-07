import { CoreDemo } from './core';
import { StakeDemo } from './stake';
import { WrapDemo } from './wrap';
import { WithdrawalsRequestDemo, WithdrawalsViewsDemo } from './withdrawals';

export const Demo = () => {
  return (
    <>
      <StakeDemo />
      <WrapDemo />
      <CoreDemo />
      <WithdrawalsRequestDemo />
      <WithdrawalsViewsDemo />
    </>
  );
};

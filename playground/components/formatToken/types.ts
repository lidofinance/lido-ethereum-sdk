import { BigNumber } from '@ethersproject/bignumber';
import { ComponentPropsWithoutRef, FC } from 'react';

export type FormatTokenComponent = FC<
  ComponentPropsWithoutRef<'span'> & {
    symbol: string;
    amount?: BigNumber;
    approx?: boolean;
  }
>;

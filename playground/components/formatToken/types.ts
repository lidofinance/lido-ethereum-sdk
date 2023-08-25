import { BigNumber } from '@ethersproject/bignumber';
import { Component } from 'types';

export type FormatTokenComponent = Component<
  'span',
  {
    symbol: string;
    amount?: BigNumber;
    approx?: boolean;
  }
>;

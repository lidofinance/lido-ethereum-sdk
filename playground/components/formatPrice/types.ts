import { Component } from 'types';

export type FormatPriceComponent = Component<
  'span',
  {
    amount: number | null;
  }
>;

import { InputProps } from '@lidofinance/lido-ui';
import { Component } from 'types';

export type TokenInputComponent = Component<
  'input',
  InputProps & { onMax: () => void }
>;

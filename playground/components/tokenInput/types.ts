import { InputProps } from '@lidofinance/lido-ui';
import { ComponentPropsWithoutRef, FC } from 'react';

export type TokenInputComponent = FC<
  ComponentPropsWithoutRef<'input'> & InputProps & { onMax: () => void }
>;

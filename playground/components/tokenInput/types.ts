import { Input } from '@lidofinance/lido-ui';
import { ComponentProps, FC } from 'react';

export type TokenInputComponent = FC<
  ComponentProps<typeof Input> & { onMax?: () => void }
>;

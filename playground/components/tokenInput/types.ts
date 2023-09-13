import { Input } from '@lidofinance/lido-ui';
import { ComponentProps, FC } from 'react';

export type TokenInputComponent = FC<
  Omit<ComponentProps<typeof Input>, 'value' | 'onChange'> & {
    maxValue?: bigint;
  } & {
    value?: bigint | null;
    onChange?: (value: bigint | null) => void;
  }
>;

export type ValueType = bigint | null;

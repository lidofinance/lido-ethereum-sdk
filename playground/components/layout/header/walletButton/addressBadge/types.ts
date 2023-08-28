import { IdenticonBadgeProps } from '@lidofinance/lido-ui';
import { ComponentPropsWithoutRef, FC } from 'react';

export type AddressBadgeComponent = FC<
  Omit<ComponentPropsWithoutRef<'div'>, 'color'> &
    Omit<IdenticonBadgeProps, 'address' | 'as'> & {
      address?: string | null;
    }
>;

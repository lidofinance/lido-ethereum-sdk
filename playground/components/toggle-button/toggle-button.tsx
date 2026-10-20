import { Button } from '@lidofinance/lido-ui';
import { ComponentProps } from 'react';

type ToggleProps = {
  onChange: (state: boolean) => void;
  value: boolean;
  title: string;
} & Omit<ComponentProps<typeof Button>, 'value' | 'onChange'>;

export const ToggleButton = ({
  onChange,
  value,
  title,
  ...props
}: ToggleProps) => {
  return (
    <Button
      variant={value ? 'filled' : 'outlined'}
      color={value ? 'success' : 'secondary'}
      aria-pressed={value}
      {...props}
      onClick={() => onChange(!value)}
    >
      {title}: {value ? 'ON' : 'OFF'}
    </Button>
  );
};

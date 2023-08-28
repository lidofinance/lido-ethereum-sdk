import { ComponentPropsWithoutRef } from 'react';

const FormatPrice = ({
  amount,
  ...rest
}: ComponentPropsWithoutRef<'span'> & {
  amount: number | null;
}) => {
  const value =
    amount == null
      ? 'Unavailable'
      : amount.toLocaleString('', {
          style: 'currency',
          currency: 'USD',
        });

  return <span {...rest}>{value}</span>;
};

export default FormatPrice;

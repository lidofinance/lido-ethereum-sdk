import { LOCALE } from 'config';
import { FormatPriceComponent } from './types';

const FormatPrice: FormatPriceComponent = (props) => {
  const { amount, ...rest } = props;
  const value =
    amount == null
      ? 'Unavailable'
      : amount.toLocaleString(LOCALE, {
          style: 'currency',
          currency: 'USD',
        });

  return <span {...rest}>{value}</span>;
};

export default FormatPrice;

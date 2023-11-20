import { formatEther } from 'viem';
import { ErrorMessage, SuccessMessage } from './styles';

type RenderTokenResultOptions = {
  alwaysShowSign?: boolean;
  colorCoded?: boolean;
};

export const renderTokenResult =
  (tokenName = '', options: RenderTokenResultOptions = {}) =>
  (amount: bigint) => {
    const Component =
      options.colorCoded && amount < 0 ? ErrorMessage : SuccessMessage;
    return (
      <Component>
        {options.alwaysShowSign && amount > 0 ? '+' : ''}
        {formatEther(amount)} {tokenName}
      </Component>
    );
  };

import { formatEther } from 'viem';
import { SuccessMessage } from './styles';

export const renderTokenResult =
  (tokenName = '') =>
  (amount: bigint) => (
    <SuccessMessage>
      {formatEther(amount)} {tokenName}
    </SuccessMessage>
  );

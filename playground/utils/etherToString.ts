import { BigNumber } from '@ethersproject/bignumber';
import { formatEther } from '@ethersproject/units';

type EtherToString = (inputEther?: BigNumber) => string;

export const etherToString: EtherToString = (inputEther) => {
  try {
    if (inputEther == null) return '';
    return formatEther(inputEther);
  } catch (error) {
    return '';
  }
};

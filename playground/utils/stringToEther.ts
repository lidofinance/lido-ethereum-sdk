import { BigNumber } from '@ethersproject/bignumber';
import { Zero } from '@ethersproject/constants';
import { parseEther } from '@ethersproject/units';

type StringToEther = (inputString: string) => BigNumber;

export const stringToEther: StringToEther = (inputString) => {
  try {
    return parseEther(inputString);
  } catch (error) {
    return Zero;
  }
};

export const stringToPositiveEther: StringToEther = (inputString) => {
  const ether = stringToEther(inputString);
  return ether.isNegative() ? Zero : ether;
};

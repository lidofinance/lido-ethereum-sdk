import { useWeb3 } from 'reef-knot/web3-react';
import { useEffect, useState } from 'react';
import { Address } from 'viem';

type UseAddressStateOptions = {
  useAccount?: boolean;
};

export const useAddressState = (
  defaultValue: Address = '0x0',
  { useAccount = false }: UseAddressStateOptions = {},
) => {
  const { account: web3account = '0x0' } = useWeb3();
  const state = useState<Address>(defaultValue);
  useEffect(() => {
    if (useAccount && web3account && (!state[0] || state[0] === defaultValue)) {
      state[1](web3account as Address);
    }
  }, [useAccount, web3account, state, defaultValue]);

  return state;
};

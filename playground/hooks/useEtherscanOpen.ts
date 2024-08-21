import {
  getEtherscanLink,
  openWindow,
  EtherscanEntities,
} from '@lido-sdk/helpers';
import { useCallback } from 'react';
import { useAccount } from 'wagmi';

export const useEtherscanOpen = (
  hash: string,
  entity: EtherscanEntities,
): (() => void) => {
  const { chainId } = useAccount();

  return useCallback(() => {
    if (chainId === undefined) return;
    const link = getEtherscanLink(chainId, hash, entity);
    openWindow(link);
  }, [chainId, entity, hash]);
};

import { FC, PropsWithChildren } from 'react';
import { ProviderWeb3 } from 'reef-knot';
import { backendRPC } from 'config';
import dynamics from '../config/dynamics';

export type EnvConfig = {
  defaultChain: string;
  supportedChains: string;
};

const Web3Provider: FC<PropsWithChildren> = ({ children }) => {
  return (
    // @ts-expect-error need to patch web3-react
    <ProviderWeb3
      defaultChainId={dynamics.defaultChain}
      supportedChainIds={dynamics.supportedChains}
      rpc={backendRPC}
    >
      {children}
    </ProviderWeb3>
  );
};

export default Web3Provider;

import { FC, PropsWithChildren } from 'react';
import { CookieThemeProvider } from '@lidofinance/lido-ui';

import { GlobalStyle } from 'styles';

import ModalProvider from './modals';
import Web3Provider from './web3';
import { LidoSDKProvider } from './sdk';
export { MODAL, ModalContext } from './modals';


const Providers: FC<PropsWithChildren> = ({ children }) => (
  <CookieThemeProvider>
    <GlobalStyle />
    <Web3Provider>
      <LidoSDKProvider>
        <ModalProvider>{children}</ModalProvider>
      </LidoSDKProvider>
    </Web3Provider>
  </CookieThemeProvider>
);

export default Providers;

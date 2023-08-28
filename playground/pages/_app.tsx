import { memo } from 'react';
import { AppProps } from 'next/app';
import { ToastContainer, CookiesTooltip } from '@lidofinance/lido-ui';
import Providers from 'providers';

const App = (props: AppProps): JSX.Element => {
  const { Component, pageProps } = props;

  return <Component {...pageProps} />;
};

const MemoApp = memo(App);

const AppWrapper = (props: AppProps): JSX.Element => {
  return (
    <Providers>
      <MemoApp {...props} />
      <CookiesTooltip />
      <ToastContainer />
    </Providers>
  );
};

export default AppWrapper;

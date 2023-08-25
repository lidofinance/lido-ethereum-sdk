import { memo } from 'react';
import { AppProps } from 'next/app';
import { ToastContainer, CookiesTooltip } from '@lidofinance/lido-ui';
import Providers from 'providers';
import { CustomAppProps } from 'types';

const App = (props: AppProps): JSX.Element => {
  const { Component, pageProps } = props;

  return <Component {...pageProps} />;
};

const MemoApp = memo(App);

const AppWrapper = (props: CustomAppProps): JSX.Element => {
  const { ...rest } = props;

  return (
    <Providers>
      <MemoApp {...rest} />
      <CookiesTooltip />
      <ToastContainer />
    </Providers>
  );
};

export default AppWrapper;

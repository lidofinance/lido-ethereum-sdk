import { FC } from 'react';
import Head from 'next/head';
import { ServicePage } from '@lidofinance/lido-ui';

const Page404: FC = () => (
  <ServicePage title="404">
    <Head>
      <title>Lido | Page Not Found</title>
    </Head>
    Page Not Found
  </ServicePage>
);

export default Page404;

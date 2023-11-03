import Head from 'next/head';

import Layout from 'components/layout';
import { Demo } from 'demo';
import { ConnectionError } from 'components/connection-error';

const Home = () => {
  return (
    <Layout title="Lido Ethereum SDK" subtitle="Playground">
      <Head>
        <title>Lido | SDK Playground</title>
      </Head>
      <ConnectionError />
      <Demo />
    </Layout>
  );
};

export default Home;

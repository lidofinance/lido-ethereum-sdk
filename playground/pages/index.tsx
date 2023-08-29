import Head from 'next/head';

import Layout from 'components/layout';
import { Demo } from 'demo';

const Home = () => {
  return (
    <Layout title="Lido Ethereum SDK" subtitle="Playground">
      <Head>
        <title>Lido | SDK Playground</title>
      </Head>
      <Demo />
    </Layout>
  );
};

export default Home;

import Head from 'next/head';

import Layout from 'components/layout';
import { Demo } from 'demo';
import { ConnectionError } from 'components/connection-error';
import { CustomRpcInput } from 'components/custom-rpc-input';

const Home = () => {
  return (
    <Layout title="Lido Ethereum SDK" subtitle="Playground">
      <Head>
        <title>Lido | SDK Playground</title>
      </Head>
      <ConnectionError />
      <CustomRpcInput />
      <Demo />
    </Layout>
  );
};

export default Home;

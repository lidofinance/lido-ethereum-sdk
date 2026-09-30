import Head from 'next/head';

import Layout from 'components/layout';
import { Sidebar } from 'components/layout/sidebar';
import { Demo, DEMO_MODULES, resolveDemoModule, useDemoLayer } from 'demo';
import { ConnectionError } from 'components/connection-error';
import { UnsupportedChainBanner } from 'components/unsupported-chain-banner';
import { useHashRoute } from 'hooks/useHashRoute';

const Home = () => {
  const [hash] = useHashRoute();
  const layer = useDemoLayer();
  const current = resolveDemoModule(hash, layer);
  const pageTitle = current
    ? `${current.group} / ${current.title} · Lido SDK Playground`
    : 'Lido SDK Playground';

  return (
    <Layout
      sidebar={
        <Sidebar modules={DEMO_MODULES} activeId={current?.id} layer={layer} />
      }
    >
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <UnsupportedChainBanner />
      <ConnectionError />
      <Demo module={current} />
    </Layout>
  );
};

export default Home;

import { FC, PropsWithChildren } from 'react';
import Head from 'next/head';
import Header from 'components/layout/header';
import Main from 'components/layout/main';
import {
  LayoutBodyStyle,
  LayoutContentStyle,
  LayoutSidebarStyle,
} from './layoutStyles';
import { LayoutProps } from './types';

const Layout: FC<PropsWithChildren<LayoutProps>> = ({ sidebar, children }) => (
  <>
    <Head>
      <meta name="description" content="Lido SDK Playground" />
    </Head>
    <Header />
    <Main>
      <LayoutBodyStyle $withSidebar={!!sidebar}>
        {sidebar && <LayoutSidebarStyle>{sidebar}</LayoutSidebarStyle>}
        <LayoutContentStyle>{children}</LayoutContentStyle>
      </LayoutBodyStyle>
    </Main>
  </>
);

export default Layout;

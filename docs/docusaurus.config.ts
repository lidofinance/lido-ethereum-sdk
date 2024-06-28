import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Lido Ethereum SDK',
  tagline:
    'Lido Ethereum SDK is a package that provides convenient tools for interacting with Lido contracts on the Ethereum network through a software development kit (SDK). This SDK simplifies working with Lido contracts and accessing their functionality',
  favicon: 'img/favicon.png',

  // Set the production url of your site here
  url: 'https://lidofinance.github.io/',

  baseUrl: '/',
  organizationName: 'lidofinance',
  projectName: 'lido-ethereum-sdk',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'examples',
        path: 'examples',
        routeBasePath: 'examples',
        sidebarPath: './sidebarsExamples.ts',
      },
    ],
  ],
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebarsSdk.ts',
          path: 'sdk',
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/lidofinance/lido-ethereum-sdk',
          routeBasePath: '/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/lidofinance/lido-ethereum-sdk',
        },
      } satisfies Preset.Options,
    ],
  ],

  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],
  themeConfig: {
    image: 'img/package_logo.png',
    navbar: {
      title: 'Lido Ethereum SDK Docs',
      logo: {
        alt: 'Lido Ethereum SDK Logo',
        src: 'img/favicon.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'sdkSidebar',
          position: 'left',
          label: 'Docs',
        },
        { to: '/examples/intro', label: 'Examples', position: 'left' },
        {
          to: '/playground',
          label: 'Playground',
          position: 'left',
          target: '_blank',
        },
        {
          href: 'https://github.com/lidofinance/lido-ethereum-sdk',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;

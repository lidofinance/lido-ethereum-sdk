import buildDynamics from './scripts/build-dynamics.mjs';
import withBundlerAnalyzer from '@next/bundle-analyzer';

buildDynamics();

const basePath = process.env.BASE_PATH || '';
const ANALYZE_BUNDLE = process.env.ANALYZE_BUNDLE == 'true';

export default withBundlerAnalyzer({
  enabled: ANALYZE_BUNDLE,
})({
  basePath,
  eslint: {
    ignoreDuringBuilds: true,
  },
  compiler: {
    styledComponents: true,
  },
  // WARNING: Vulnerability fix, don't remove until default Next.js image loader is patched
  images: {
    loader: 'custom',
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack', 'url-loader'],
    });

    return config;
  },
  async headers() {
    return [
      {
        // required for gnosis save apps
        source: '/manifest.json',
        headers: [{ key: 'Access-Control-Allow-Origin', value: '*' }],
      },
    ];
  },
  serverRuntimeConfig: {
    basePath,
  },
});

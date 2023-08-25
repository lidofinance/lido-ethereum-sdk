import type { NextApiRequest, NextApiResponse } from 'next';
import { getRPCUrls } from '@lido-sdk/fetch';
import { CHAINS } from '@lido-sdk/constants';
import {
  wrapRequest,
  defaultErrorHandler,
} from '@lidofinance/next-api-wrapper';
import getConfig from 'next/config';
import { fetchWithFallbacks } from 'utils/fetchWithFallbacks';

const { serverRuntimeConfig } = getConfig();
const { infuraApiKey, alchemyApiKey, apiProviderUrls } =
  serverRuntimeConfig as RuntimeConfig;

type Rpc = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

const rpc: Rpc = async (req, res) => {
  console.debug('Request to RPC');
  const chainId = Number(req.query.chainId);

  if (!CHAINS[chainId]) {
    throw new Error(`Chain ${chainId} is not supported`);
  }

  const urls = getRPCUrls(chainId, {
    infura: infuraApiKey,
    alchemy: alchemyApiKey,
  });

  const customProvider = apiProviderUrls?.[chainId];

  if (customProvider) {
    urls.unshift(customProvider);
  }

  const requested = await fetchWithFallbacks(urls, {
    method: 'POST',
    // Next by default parses our body for us, we don't want that here
    body: JSON.stringify(req.body),
  });

  res.setHeader(
    'Content-Type',
    requested.headers.get('Content-Type') ?? 'application/json',
  );
  res.status(requested.status).send(requested.body);
};

// Error handler wrapper
export default wrapRequest([defaultErrorHandler({ serverLogger: console })])(
  rpc,
);

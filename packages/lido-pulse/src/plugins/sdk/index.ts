// Lido SDK plugin
import { LidoSDK } from '@lidofinance/lido-ethereum-sdk';
import { createPublicClient, http } from 'viem';
import { holesky } from 'viem/chains';

import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

declare module 'fastify' {
  interface FastifyInstance {
    lidoSDK: LidoSDK;
  }
}

const fastifyLidoSDK: FastifyPluginAsync = async (fastify) => {
  const envs: { RPC_PROVIDER_URL: string } = fastify.getEnvs();
  const rpcProvider = createPublicClient({
    chain: holesky,
    transport: http(envs.RPC_PROVIDER_URL),
  });
  const lidoSDK = new LidoSDK({
    chainId: holesky.id,
    rpcProvider,
  });

  if (!fastify.lidoSDK) {
    fastify.decorate('lidoSDK', lidoSDK);
  }
};

export default fp(fastifyLidoSDK, '4.x');

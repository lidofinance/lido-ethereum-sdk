import Fastify from 'fastify';
import fastifyEnv from '@fastify/env';

import { SDKPlugin, RPCPlugin } from './plugins/index.js';
import { initSwagger, rpcSwaggerSchema } from './swagger.js';

const fastify = Fastify({
  logger: true,
  ajv: {
    customOptions: {
      allowUnionTypes: true,
    },
  },
});

const schema = {
  type: 'object',
  required: ['RPC_PROVIDER_URL'],
  properties: {
    RPC_PROVIDER_URL: {
      type: 'string',
    },
  },
};
const options = {
  dotenv: true,
  schema: schema,
};

void initSwagger(fastify);

void fastify.register(fastifyEnv, options);
void fastify.register(SDKPlugin);
void fastify.register(RPCPlugin);

void fastify.register(async (instance) => {
  const rpc = instance.rpc;

  instance.post('/rpc', rpcSwaggerSchema, rpc);
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    fastify.swagger();
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
process.on('unhandledRejection', function (reason) {
  console.error('unhandledRejection', reason);
});

void start();

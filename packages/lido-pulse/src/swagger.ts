import { FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

export const initSwagger = async (fastify: FastifyInstance) => {
  await fastify.register(swagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'Lido Wave swagger',
        description: 'Testing the Lido Wave swagger API',
        version: '0.1.0',
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Development server',
        },
      ],
      externalDocs: {
        url: 'https://lidofinance.github.io/lido-ethereum-sdk/',
        description: 'Find more info here',
      },
    },
  });
  await fastify.register(swaggerUi, {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false,
    },
    uiHooks: {
      onRequest: function (_request, _reply, next) {
        next();
      },
      preHandler: function (_request, _reply, next) {
        next();
      },
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject, _request, _reply) => {
      return swaggerObject;
    },
    transformSpecificationClone: true,
  });
};

export const rpcSwaggerSchema = {
  schema: {
    summary: 'JSON-RPC endpoint for Lido SDK interactions',
    description:
      'This endpoint handles JSON-RPC requests to interact with the Lido SDK.',
    operationId: 'postRpc',
    body: {
      type: ['array', 'object'],
      properties: {
        method: {
          type: 'string',
        },
        jsonrpc: { type: 'string' },
        id: {
          type: 'number',
        },
        params: {
          type: ['array', 'object'],
        },
      },
      required: ['jsonrpc', 'method', 'params'],
      examples: [
        {
          method: 'shares.balance',
          id: 1,
          jsonrpc: '2.0',
          params: ['0x123'],
        },
      ],
    },
  },
};

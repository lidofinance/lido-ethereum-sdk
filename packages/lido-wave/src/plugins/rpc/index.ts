import {
  FastifyPluginAsync,
  FastifyReply,
  FastifyRequest,
  FastifyInstance,
} from 'fastify';
import fp from 'fastify-plugin';

import { ERROR_CODES } from './errors.js';
import {
  executeFunctionByName,
  parseParams,
  throwRpcError,
  isNil,
} from './utils.js';
import { VERSION } from './constants.js';
import { RPC_DATA, RPC_RESPONSE } from './types.js';

declare module 'fastify' {
  interface FastifyInstance {
    rpc: (req: FastifyRequest, res: FastifyReply) => Promise<void>;
  }
}

// @ts-expect-error BigInt is not supported by JSON
BigInt.prototype.toJSON = function () {
  return this.toString();
};

const fastifyRPC: FastifyPluginAsync = async (fastify) => {
  const rpc = createRpc(fastify);

  if (!fastify.rpc) {
    fastify.decorate('rpc', rpc);
  }
};

export const createRpc =
  (fastify: FastifyInstance) =>
  async (req: FastifyRequest, res: FastifyReply) => {
    const rpcData = req.body as RPC_DATA;
    if (Array.isArray(rpcData)) {
      res.send(await handleBatchRequest(rpcData, fastify));
    } else if (typeof rpcData === 'object' && rpcData !== null) {
      res.send(await handleSingleRequest(rpcData, fastify));
    } else {
      res.send({
        jsonrpc: {},
        error: {
          code: ERROR_CODES.PARSE_ERROR.code,
          message: ERROR_CODES.PARSE_ERROR.message,
          data: null,
        },
        id: null,
      });
    }
  };

const handleBatchRequest = async (
  bachBody: RPC_DATA[],
  fastify: FastifyInstance,
) => {
  return Promise.all(
    bachBody.reduce((memo: Promise<RPC_RESPONSE>[], body) => {
      const result = handleSingleRequest(body, fastify);

      if (!isNil(body.id)) memo.push(result);
      return memo;
    }, []),
  );
};

const handleSingleRequest = async (
  body: RPC_DATA,
  fastify: FastifyInstance,
): Promise<RPC_RESPONSE> => {
  const { id, method, jsonrpc, params = {} } = body;

  try {
    const parsedParams = Array.isArray(params) ? params : parseParams(params);

    if (jsonrpc !== VERSION) {
      throwRpcError(
        `${ERROR_CODES.INVALID_REQUEST.message}, wrong version - ${jsonrpc}`,
        ERROR_CODES.INVALID_REQUEST.code,
      );
    }

    const result = await executeFunctionByName(method, fastify, parsedParams);

    if (!(result == null)) return { jsonrpc, result, id };
  } catch (e: any) {
    const error = {
      code: Number(e.code || e.status || ERROR_CODES.INTERNAL_ERROR.code),
      message: e.message || ERROR_CODES.INTERNAL_ERROR.message,
      data: null,
    };
    if (e && e.data) error.data = e.data;

    return { jsonrpc, error, id: id || null };
  }

  return null;
};

export default fp(fastifyRPC, '4.x');

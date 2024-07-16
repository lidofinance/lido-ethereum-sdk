import { LidoSDK } from '@lidofinance/lido-ethereum-sdk';
import { FastifyInstance } from 'fastify';

import { ERROR_CODES } from './errors.js';
import { PARAMS } from './types.js';

export const isNil = (value: any) => value == null;

export const executeFunctionByName = <T extends PARAMS>(
  functionName: string,
  fastify: FastifyInstance,
  args: T,
) => {
  const namespaces = functionName.split('.') as (keyof LidoSDK)[];
  const func = namespaces.pop() as keyof LidoSDK;
  let context: LidoSDK | any = fastify.lidoSDK;

  for (const namespace of namespaces) {
    context = context[namespace];
  }

  if (!context[func]) {
    throwRpcError(
      ERROR_CODES.METHOD_NOT_FOUND.message,
      ERROR_CODES.METHOD_NOT_FOUND.code,
    );
  }

  if (Array.isArray(args)) return context[func](...args);
  return context[func](args);
};

export const parseParams = <
  T extends { [key: string]: { __type: string; value: any } | string | number },
>(
  params: T,
): Record<string, any> => {
  try {
    const keys = Object.keys(params);

    return keys.reduce((memo: Record<string, any>, key) => {
      const field = params[key];

      if (typeof field === 'object' && field.__type) {
        // TODO: change to switch if more types are added
        if (field.__type === 'bigInt') memo[key] = BigInt(field.value);
        else memo[key] = field.value;
      } else if (typeof field === 'object') {
        memo[key] = parseParams(field);
      } else {
        memo[key] = field;
      }

      return memo;
    }, {});
  } catch (e) {
    return throwRpcError(
      ERROR_CODES.INVALID_PARAMS.message,
      ERROR_CODES.INVALID_PARAMS.code,
    );
  }
};

export const throwRpcError = (message = 'JSON-RPC error', code = 500) => {
  const err = new Error(message);
  (err as any).code = code;

  throw err;
};

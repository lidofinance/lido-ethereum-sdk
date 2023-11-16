import type { LidoSDKCacheable } from '../class-primitives/cacheable.js';
import { isBigint } from '../utils/index.js';

import { callConsoleMessage } from './utils.js';

const serializeArgs = (args: any[]) =>
  args
    .map((arg: any) =>
      JSON.stringify(arg, (_key, value) => {
        return isBigint(value) ? value.toString() : value;
      }),
    )
    .join(':');

const getDecoratorArgsString = function <This>(this: This, args?: string[]) {
  if (!args) return '';

  const argsStringArr = args.map((arg) => {
    const field = arg
      .split('.')
      .reduce((a, b) => (a as { [key: string]: any })[b], this);

    return arg && typeof field === 'function' ? field.call(this) : field;
  });

  return serializeArgs(argsStringArr);
};

export const Cache = function (timeMs = 0, cacheArgs?: string[]) {
  return function CacheMethod<
    This extends LidoSDKCacheable,
    Args extends any[],
    Return,
  >(
    originalMethod: (this: This, ...args: Args) => Return,
    context: ClassMethodDecoratorContext<
      This,
      (this: This, ...args: Args) => Return
    >,
  ) {
    const methodName = String(context.name);
    const replacementMethod = function (this: This, ...args: Args): Return {
      const cache = this.cache;
      const decoratorArgsKey = getDecoratorArgsString.call(this, cacheArgs);
      const argsKey = serializeArgs(args);
      const cacheKey = `${methodName}:${decoratorArgsKey}:${argsKey}`;

      if (cache.has(cacheKey)) {
        const cachedEntry = cache.get(cacheKey);
        const currentTime = Date.now();

        if (cachedEntry && currentTime - cachedEntry.timestamp <= timeMs) {
          callConsoleMessage.call(
            this,
            'Cache:',
            `Using cache for method '${methodName}'.`,
          );
          return cachedEntry.data;
        } else {
          callConsoleMessage.call(
            this,
            'Cache:',
            `Cache for method '${methodName}' has expired.`,
          );
          cache.delete(cacheKey);
        }
      }

      callConsoleMessage.call(
        this,
        'Cache:',
        `Cache for method '${methodName}' set.`,
      );
      const result = originalMethod.call(this, ...args);
      if (result instanceof Promise) {
        void result.then((resolvedResult) =>
          cache.set(cacheKey, { data: resolvedResult, timestamp: Date.now() }),
        );
      } else cache.set(cacheKey, { data: result, timestamp: Date.now() });

      return result;
    };
    return replacementMethod;
  };
};

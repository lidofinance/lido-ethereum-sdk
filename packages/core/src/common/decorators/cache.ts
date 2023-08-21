import { callConsoleMessage } from "./utils";

export const Cache = function (timeMs = 0) {
  const cache = new Map<string, { data: any; timestamp: number }>();

  return function CacheMethod<This, Args extends any[], Return>(
    originalMethod: (this: This, ...args: Args) => Return,
    context: ClassMethodDecoratorContext<
      This,
      (this: This, ...args: Args) => Return
    >
  ) {
    const methodName = String(context.name);
    const replacementMethod = function (this: This, ...args: Args): Return {
      const hash = JSON.stringify(args);
      const cacheKey = `${methodName}:${hash}`;

      if (cache.has(cacheKey)) {
        const cachedEntry = cache.get(cacheKey);
        const currentTime = Date.now();

        if (cachedEntry && currentTime - cachedEntry.timestamp <= timeMs) {
          callConsoleMessage(
            "Cache:",
            `Using cache for method '${methodName}'.`
          );
          return cachedEntry.data;
        } else {
          callConsoleMessage(
            "Cache:",
            `Cache for method '${methodName}' has expired.`
          );
          cache.delete(cacheKey);
        }
      }

      callConsoleMessage(
        "Cache:",
        `Cache for method '${methodName}' not found.`
      );
      const result = originalMethod.call(this, ...args);
      cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    };
    return replacementMethod;
  };
};

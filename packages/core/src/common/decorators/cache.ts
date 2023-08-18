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
      if (cache.has(methodName)) {
        const cachedEntry = cache.get(methodName);
        const currentTime = Date.now();

        if (cachedEntry && currentTime - cachedEntry.timestamp <= timeMs) {
          console.log(`Caching: Using cache for method '${methodName}'.`);
          return cachedEntry.data;
        } else {
          console.log(`Caching: Cache for method '${methodName}' has expired.`);
          cache.delete(methodName);
        }
      }

      console.log(`Caching: Caching method '${methodName}'.`);
      const result = originalMethod.call(this, ...args);
      cache.set(methodName, { data: result, timestamp: Date.now() });
      return result;
    };
    return replacementMethod;
  };
};

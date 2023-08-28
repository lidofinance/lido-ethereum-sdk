import { callConsoleMessage } from "./utils.js";

const serializeArgs = (...args: any[]) =>
  args.map((arg: any) => arg.toString()).join(":");

const getDecoratorArgsString = function <This>(this: This, args?: string[]) {
  if (!args) return "";

  const argsString = args.map((arg) => {
    const field = arg
      .split(".")
      .reduce((a, b) => (a as { [key: string]: any })[b], this);

    return arg && typeof field === "function" ? field.call(this) : field;
  });

  return serializeArgs(argsString);
};

export const Cache = function (timeMs = 0, cacheArgs?: string[]) {
  const cache = new Map<string, { data: any; timestamp: number }>();

  return function CacheMethod<This, Args extends any[], Return>(
    originalMethod: (this: This, ...args: Args) => Return,
    context: ClassMethodDecoratorContext<
      This,
      (this: This, ...args: Args) => Return
    >,
  ) {
    const methodName = String(context.name);
    const replacementMethod = function (this: This, ...args: Args): Return {
      const decoratorArgsKey = getDecoratorArgsString.call(this, cacheArgs);
      const argsKey = serializeArgs(args);
      const cacheKey = `${methodName}:${decoratorArgsKey}:${argsKey}`;

      if (cache.has(cacheKey)) {
        const cachedEntry = cache.get(cacheKey);
        const currentTime = Date.now();

        if (cachedEntry && currentTime - cachedEntry.timestamp <= timeMs) {
          callConsoleMessage(
            "Cache:",
            `Using cache for method '${methodName}'.`,
          );
          return cachedEntry.data;
        } else {
          callConsoleMessage(
            "Cache:",
            `Cache for method '${methodName}' has expired.`,
          );
          cache.delete(cacheKey);
        }
      }

      callConsoleMessage("Cache:", `Cache for method '${methodName}' set.`);
      const result = originalMethod.call(this, ...args);
      cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    };
    return replacementMethod;
  };
};

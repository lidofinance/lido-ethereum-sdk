export const Logger = function (headMessage = "LOG:") {
  return function LoggerMethod<This, Args extends any[], Return>(
    originalMethod: (this: This, ...args: Args) => Return,
    context: ClassMethodDecoratorContext<
      This,
      (this: This, ...args: Args) => Return
    >
  ) {
    const methodName = String(context.name);

    const replacementMethod = function (this: This, ...args: Args): Return {
      console.log(`${headMessage} Entering method '${methodName}'.`);
      const result = originalMethod.call(this, ...args);

      if (result instanceof Promise) {
        return result
          .then((resolvedResult) => {
            console.log(`${headMessage} Exiting method '${methodName}'.`);
            return resolvedResult;
          })
          .catch((error) => {
            console.log(
              `${headMessage} Exiting method '${methodName}' with error: ${error}.`
            );
            return error;
          }) as Return;
      } else {
        console.log(`${headMessage} Exiting method '${methodName}'.`);
        return result;
      }
    };

    return replacementMethod;
  };
};

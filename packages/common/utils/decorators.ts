export function Logger(headMessage = "LOG:") {
  return function LoggerMethod<This, Args extends any[], Return>(
    originalMethod: (this: This, ...args: Args) => Return,
    context: ClassMethodDecoratorContext<
      This,
      (this: This, ...args: Args) => Return
    >
  ) {
    const methodName = String(context.name);
    function replacementMethod(this: This, ...args: Args): Return {
      console.log(`${headMessage} Entering method '${methodName}'.`);
      const result = originalMethod.call(this, ...args);
      console.log(`${headMessage} Exiting method '${methodName}'.`);

      return result;
    }
    return replacementMethod;
  };
}

export function ErrorHandler(headMessage = "Error:") {
  return function ErrorHandlerMethod<This, Args extends any[], Return>(
    originalMethod: (this: This, ...args: Args) => Return,
    context: ClassMethodDecoratorContext<
      This,
      (this: This, ...args: Args) => Return
    >
  ) {
    const methodName = String(context.name);
    function replacementMethod(this: This, ...args: Args): Return {
      try {
        return originalMethod.call(this, ...args);
      } catch (error) {
        console.error(`${headMessage} Error in method '${methodName}'.`);
        throw error;
      }
    }
    return replacementMethod;
  };
}

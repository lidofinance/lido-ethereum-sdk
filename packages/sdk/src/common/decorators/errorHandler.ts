import { callConsoleMessage } from "./utils";
import { HeadMessage } from "./types";

export const ErrorHandler = function (headMessage: HeadMessage = "Error:") {
  return function ErrorHandlerMethod<This, Args extends any[], Return>(
    originalMethod: (this: This, ...args: Args) => Return,
    context: ClassMethodDecoratorContext<
      This,
      (this: This, ...args: Args) => Return
    >
  ) {
    const methodName = String(context.name);
    const replacementMethod = function (this: This, ...args: Args): Return {
      try {
        return originalMethod.call(this, ...args);
      } catch (error) {
        callConsoleMessage(
          headMessage,
          `Error in method '${methodName}': ${error}.`,
          "Error:"
        );
        console.error(`${headMessage} Error in method '${methodName}'.`);
        throw error;
      }
    };
    return replacementMethod;
  };
};

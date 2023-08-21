import { callConsoleMessage } from "./utils";
import { HeadMessage } from "./types";

export const Logger = function (headMessage: HeadMessage = "LOG:") {
  return function LoggerMethod<This, Args extends any[], Return>(
    originalMethod: (this: This, ...args: Args) => Return,
    context: ClassMethodDecoratorContext<
      This,
      (this: This, ...args: Args) => Return
    >
  ) {
    const methodName = String(context.name);

    const replacementMethod = function (this: This, ...args: Args): Return {
      callConsoleMessage(headMessage, `Entering method '${methodName}'.`);
      const result = originalMethod.call(this, ...args);

      if (result instanceof Promise) {
        return result
          .then((resolvedResult) => {
            callConsoleMessage(headMessage, `Exiting method '${methodName}'.`);
            return resolvedResult;
          })
          .catch((error) => {
            callConsoleMessage(
              headMessage,
              `Exiting method '${methodName}' with error: ${error}.`,
              "Error:"
            );
            throw error;
          }) as Return;
      } else {
        callConsoleMessage(headMessage, `Exiting method '${methodName}'.`);
        return result;
      }
    };

    return replacementMethod;
  };
};

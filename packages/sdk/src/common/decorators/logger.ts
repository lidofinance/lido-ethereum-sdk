import { callConsoleMessage } from './utils.js';
import { type HeadMessage } from './types.js';

export const Logger = function (headMessage: HeadMessage = 'LOG:') {
  return function LoggerMethod<This, Args extends any[], Return>(
    originalMethod: (this: This, ...args: Args) => Return,
    context: ClassMethodDecoratorContext<
      This,
      (this: This, ...args: Args) => Return
    >,
  ) {
    const methodName = String(context.name);

    const replacementMethod = function (this: This, ...args: Args): Return {
      if (headMessage === 'Deprecation:')
        callConsoleMessage.call(
          this,
          headMessage,
          `Method '${methodName}' is being deprecated in the next major version`,
        );

      callConsoleMessage.call(
        this,
        headMessage,
        `Entering method '${methodName}'.`,
      );
      const result = originalMethod.call(this, ...args);

      if (result instanceof Promise) {
        return result
          .then((resolvedResult) => {
            callConsoleMessage.call(
              this,
              headMessage,
              `Exiting method '${methodName}'.`,
            );
            return resolvedResult;
          })
          .catch((error) => {
            callConsoleMessage.call(
              this,
              headMessage,
              `Exiting method '${methodName}' with error.`,
              'Error:',
            );
            throw error;
          }) as Return;
      } else {
        callConsoleMessage.call(
          this,
          headMessage,
          `Exiting method '${methodName}'.`,
        );
        return result;
      }
    };

    return replacementMethod;
  };
};

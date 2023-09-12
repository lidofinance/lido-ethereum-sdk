import { callConsoleMessage, extractError } from './utils.js';
import { type HeadMessage } from './types.js';

export const ErrorHandler = function (headMessage: HeadMessage = 'Error:') {
  return function ErrorHandlerMethod<This, Args extends any[], Return>(
    originalMethod: (this: This, ...args: Args) => Return,
    context: ClassMethodDecoratorContext<
      This,
      (this: This, ...args: Args) => Return
    >,
  ) {
    const methodName = String(context.name);
    const replacementMethod = function (this: This, ...args: Args): Return {
      const callback = args[0]?.callback;

      try {
        const result = originalMethod.call(this, ...args);

        if (result instanceof Promise) {
          return result
            .then((resolvedResult) => resolvedResult)
            .catch((error) => {
              callConsoleMessage.call(
                this,
                headMessage,
                `Error in method '${methodName}'.`,
                'Error:',
              );

              let txError = extractError.call(this, error);
              callback?.({ stage: 'error', payload: txError });

              throw txError;
            }) as Return;
        } else {
          callConsoleMessage.call(
            this,
            headMessage,
            `Exiting method '${methodName}'.`,
          );
          return result;
        }
      } catch (error) {
        callConsoleMessage.call(
          this,
          headMessage,
          `Error in method '${methodName}'.`,
          'Error:',
        );

        let txError = extractError.call(this, error);
        callback?.({ stage: 'error', payload: txError });

        throw txError;
      }
    };
    return replacementMethod;
  };
};

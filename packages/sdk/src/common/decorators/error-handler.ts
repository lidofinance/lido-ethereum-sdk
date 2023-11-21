import { callConsoleMessage } from './utils.js';
import { type HeadMessage } from './types.js';
import { SDKError } from '../index.js';

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
          return result.catch((error) => {
            callConsoleMessage.call(
              this,
              headMessage,
              `Error in method '${methodName}'.`,
              'Error:',
            );

            const txError = SDKError.from(error);
            callback?.({ stage: 'error', payload: txError });

            throw txError;
          }) as Return;
        } else {
          return result;
        }
      } catch (error) {
        callConsoleMessage.call(
          this,
          headMessage,
          `Error in method '${methodName}'.`,
          'Error:',
        );

        const txError = SDKError.from(error);
        callback?.({ stage: 'error', payload: txError });

        throw txError;
      }
    };
    return replacementMethod;
  };
};

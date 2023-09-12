import { type LidoSDKCore } from '../../core/index.js';
import { callConsoleMessage } from './utils.js';
import { type HeadMessage } from './types.js';

const isBus = function (
  value: unknown,
): value is { bus: { core?: LidoSDKCore } } {
  return !!value && typeof value === 'object' && 'bus' in value;
};

const isCore = function (value: unknown): value is { core?: LidoSDKCore } {
  return !!value && typeof value === 'object' && 'core' in value;
};

const extractError = function <This>(this: This, error: unknown) {
  let txError = error;

  if (isBus(this)) {
    const { message, code } = (this.bus.core as LidoSDKCore)?.getErrorMessage?.(
      error,
    );

    txError = (this.bus?.core as LidoSDKCore)?.error?.({
      message,
      error,
      code,
    });
  } else if (isCore(this)) {
    const { message, code } = (this.core as LidoSDKCore)?.getErrorMessage?.(
      error,
    );
    txError = (this.core as LidoSDKCore)?.error?.({
      message,
      error,
      code,
    });
  }

  return txError;
};

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
              callConsoleMessage(
                headMessage,
                `Error in method '${methodName}'.`,
                'Error:',
              );

              let txError = extractError.call(this, error);
              callback?.({ stage: 'error', payload: txError });

              throw txError;
            }) as Return;
        } else {
          callConsoleMessage(headMessage, `Exiting method '${methodName}'.`);
          return result;
        }
      } catch (error) {
        callConsoleMessage(
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

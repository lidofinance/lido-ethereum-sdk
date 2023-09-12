import { callConsoleMessage } from './utils.js';
import { HeadMessage } from './types.js';

export const Initialize = function (headMessage: HeadMessage = 'Init:') {
  return function LoggerMethod<This, Args extends any[], Return>(
    originalMethod: (this: This, ...args: Args) => Return,
    _context: ClassMethodDecoratorContext<
      This,
      (this: This, ...args: Args) => Return
    >,
  ) {
    const replacementMethod = function (this: This, ...args: Args): Return {
      const result = originalMethod.call(this, ...args);
      const version = args[1];

      callConsoleMessage.call(this, headMessage, `LIDO SDK ${version}  `);

      return result;
    };

    return replacementMethod;
  };
};

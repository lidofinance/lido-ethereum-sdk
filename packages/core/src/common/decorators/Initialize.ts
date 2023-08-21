import { callConsoleMessage } from "./utils";
import { HeadMessage } from "./types";

export const Initialize = function (headMessage: HeadMessage = "Init:") {
  return function LoggerMethod<This, Args extends any[], Return>(
    originalMethod: (this: This, ...args: Args) => Return,
    _context: ClassMethodDecoratorContext<
      This,
      (this: This, ...args: Args) => Return
    >
  ) {
    const replacementMethod = function (this: This, ...args: Args): Return {
      const result = originalMethod.call(this, ...args);
      const version = args[1];

      callConsoleMessage(headMessage, `LIDO SDK v${version}  `);

      return result;
    };

    return replacementMethod;
  };
};

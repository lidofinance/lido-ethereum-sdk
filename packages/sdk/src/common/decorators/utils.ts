import { type LidoSDKCore } from '../../core/index.js';
import { type LOG_MODE } from '../../core/types.js';

import { ConsoleCss } from './constants.js';
import { HeadMessage } from './types.js';

const getLogMode = function <This>(this: This) {
  let logMode: LOG_MODE = 'info';

  if (isBus(this)) {
    logMode = (this.bus.core as LidoSDKCore)?.logMode;
  } else if (isCore(this)) {
    logMode = (this.core as LidoSDKCore)?.logMode;
  }

  return logMode;
};

export const callConsoleMessage = function <This>(
  this: This,
  headMessage: HeadMessage,
  message: string,
  cssHeadMessage?: HeadMessage,
) {
  const logMode = getLogMode.call(this);

  if (headMessage === 'Init:') {
    return console.log(
      `%c${message}`,
      `${ConsoleCss[cssHeadMessage ?? headMessage]}`,
    );
  }

  if (logMode === 'debug') {
    return console.log(
      `%c${headMessage}`,
      `${ConsoleCss[cssHeadMessage ?? headMessage]}`,
      message,
    );
  }
};

export const isBus = function (
  value: unknown,
): value is { bus: { core?: LidoSDKCore } } {
  return !!value && typeof value === 'object' && 'bus' in value;
};

export const isCore = function (
  value: unknown,
): value is { core?: LidoSDKCore } {
  return !!value && typeof value === 'object' && 'core' in value;
};

export const extractError = function <This>(this: This, error: unknown) {
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

/* eslint-disable no-console */
import type { LidoSDKCore } from '../../core/index.js';
import type { LOG_MODE } from '../../core/types.js';

import { ConsoleCss } from './constants.js';
import { HeadMessage } from './types.js';

const getLogMode = function <This>(this: This): LOG_MODE {
  let logMode: LOG_MODE = 'info';

  if (isCore(this)) {
    logMode = this.logMode;
  }
  if (hasBus(this)) {
    logMode = (this.bus.core as LidoSDKCore)?.logMode;
  } else if (hasCore(this)) {
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

  if (logMode === 'none') return;

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

export const isCore = function (value: unknown): value is LidoSDKCore {
  return !!value && typeof value === 'object' && 'rpcProvider' in value;
};

export const hasBus = function (
  value: unknown,
): value is { bus: { core?: LidoSDKCore } } {
  return !!value && typeof value === 'object' && 'bus' in value;
};

export const hasCore = function (
  value: unknown,
): value is { core?: LidoSDKCore } {
  return !!value && typeof value === 'object' && 'core' in value;
};

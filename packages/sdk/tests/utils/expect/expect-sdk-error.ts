import { ERROR_CODE, SDKError } from '../../../src/index.js';
import { expect } from '@jest/globals';

export const expectSDKError = async (
  callback: () => any | Promise<any>,
  code?: ERROR_CODE,
) => {
  try {
    await callback();
    throw new Error('expected callback to throw');
  } catch (error) {
    if (typeof error === 'object' && error && 'message' in error)
      expect(error.message).not.toBe('expected callback to throw');
    expect(error).toBeInstanceOf(SDKError);
    const sdkError = error as SDKError;
    code && expect(sdkError.code).toBe(code);
  }
};

import { ERROR_CODE, SDKError } from '../../../src/index.js';
import { expect } from '@jest/globals';

export const expectSDKError = async (
  callback: () => any | Promise<any>,
  code?: ERROR_CODE,
) => {
  try {
    await callback();
    throw new Error('expected callback to trow');
  } catch (error) {
    expect(error).toBeInstanceOf(SDKError);
    const sdkError = error as SDKError;
    code && expect(sdkError.code).toBe(code);
  }
};

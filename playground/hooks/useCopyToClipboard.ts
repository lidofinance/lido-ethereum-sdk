import { useCallback } from 'react';
import copy from 'copy-to-clipboard';
import { ToastInfo } from '@lidofinance/lido-ui';

export const useCopyToClipboard = (text: string): (() => void) => {
  return useCallback(() => {
    copy(text);
    ToastInfo('Copied to clipboard');
  }, [text]);
};

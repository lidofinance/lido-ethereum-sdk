import {
  type TransactionCallback,
  TransactionCallbackStage,
} from '@lidofinance/lido-ethereum-sdk/core';
import { toast } from '@lidofinance/lido-ui';

export const transactionToast: TransactionCallback = ({ stage }) => {
  switch (stage) {
    case TransactionCallbackStage.PERMIT:
      return toast('Permit', { type: 'info' });
    case TransactionCallbackStage.GAS_LIMIT:
      return toast('Gas limit', { type: 'info' });
    case TransactionCallbackStage.SIGN:
      return toast('Signing', { type: 'info' });
    case TransactionCallbackStage.RECEIPT:
      return toast('Receipt', { type: 'info' });
    case TransactionCallbackStage.CONFIRMATION:
      return toast('Confirmation', { type: 'success' });
    case TransactionCallbackStage.ERROR:
      return toast('Error', { type: 'error' });
    case TransactionCallbackStage.DONE:
      return toast('Success', { type: 'success' });
    case TransactionCallbackStage.MULTISIG_DONE:
      return toast('Multisig Success', { type: 'success' });
  }
};

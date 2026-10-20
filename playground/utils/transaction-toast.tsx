import {
  type TransactionCallback,
  TransactionCallbackStage,
} from '@lidofinance/lido-ethereum-sdk/core';
import { toast } from '@lidofinance/lido-ui';
import type { Hash } from 'viem';
import { useChainId, useChains } from 'wagmi';

const shortHash = (hash: string) => `${hash.slice(0, 10)}…${hash.slice(-8)}`;

// Rendered inside ToastContainer, which lives under the wagmi provider.
const TxToast = ({ label, hash }: { label: string; hash: Hash }) => {
  const chainId = useChainId();
  const explorer = useChains().find((chain) => chain.id === chainId)
    ?.blockExplorers?.default.url;

  return (
    <span>
      {label}:{' '}
      {explorer ? (
        <a href={`${explorer}/tx/${hash}`} target="_blank" rel="noreferrer">
          {shortHash(hash)}
        </a>
      ) : (
        <code>{shortHash(hash)}</code>
      )}
    </span>
  );
};

export const transactionToast: TransactionCallback = ({ stage, payload }) => {
  switch (stage) {
    case TransactionCallbackStage.PERMIT:
      toast('Permit', { type: 'info' });
      break;
    case TransactionCallbackStage.GAS_LIMIT:
      toast('Gas limit', { type: 'info' });
      break;
    case TransactionCallbackStage.SIGN:
      toast('Signing', { type: 'info' });
      break;
    case TransactionCallbackStage.RECEIPT:
      toast(<TxToast label="Sent" hash={payload} />, { type: 'info' });
      break;
    case TransactionCallbackStage.CONFIRMATION:
      toast(<TxToast label="Confirmed" hash={payload.transactionHash} />, {
        type: 'success',
      });
      break;
    case TransactionCallbackStage.ERROR:
      toast(`Error: ${payload.errorMessage ?? payload.message}`, {
        type: 'error',
      });
      break;
    case TransactionCallbackStage.DONE:
      toast('Success', { type: 'success' });
      break;
    case TransactionCallbackStage.MULTISIG_DONE:
      toast('Multisig Success', { type: 'success' });
      break;
  }
  return undefined;
};

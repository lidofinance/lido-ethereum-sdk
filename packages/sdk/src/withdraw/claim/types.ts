import type { CommonTransactionProps } from '../../core/index.js';

export type ClaimRequestsProps = CommonTransactionProps & {
  requestsIds: bigint[];
  hints?: bigint[];
};

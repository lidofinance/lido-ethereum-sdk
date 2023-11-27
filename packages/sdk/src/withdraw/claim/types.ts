import type { CommonTransactionProps } from '../../core/index.js';

export type ClaimRequestsProps = CommonTransactionProps & {
  requestsIds: readonly bigint[];
  hints?: readonly bigint[];
};

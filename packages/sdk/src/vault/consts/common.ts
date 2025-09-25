import { parseEther } from 'viem';

export const VAULTS_CONNECT_DEPOSIT = parseEther('1');

/**
 * @notice Minimal confirmation expiry in seconds.
 */
export const MIN_CONFIRM_EXPIRY = 24n * 3600n;

/**
 * @notice Maximal confirmation expiry in seconds.
 */
export const MAX_CONFIRM_EXPIRY = 30n * 24n * 3600n;

/**
 * @notice Maximal node operator fee rate.
 */
export const MAX_NODE_OPERATOR_FEE_RATE = 100;

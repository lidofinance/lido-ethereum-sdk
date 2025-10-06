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

export const PROXY_CODE_PAD_LEFT = '0x363d3d373d3d3d363d73';
export const PROXY_CODE_PAD_RIGHT = '5af43d82803e903d91602b57fd5bf';

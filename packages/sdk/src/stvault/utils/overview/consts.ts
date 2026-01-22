export const VAULT_TOTAL_BASIS_POINTS = 10_000;

export const ceilDiv = (numerator: bigint, denominator: bigint): bigint => {
  const result = numerator / denominator;
  return numerator % denominator === 0n ? result : result + 1n;
};

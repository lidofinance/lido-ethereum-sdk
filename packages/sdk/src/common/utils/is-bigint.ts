export const isBigint = (value: unknown): value is bigint => {
  return typeof value === 'bigint';
};

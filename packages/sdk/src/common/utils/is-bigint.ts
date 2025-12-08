export const isBigint = (
  value: number | string | bigint | null | undefined | boolean,
): value is bigint => {
  return typeof value === 'bigint';
};

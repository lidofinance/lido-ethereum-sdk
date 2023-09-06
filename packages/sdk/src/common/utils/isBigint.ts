export const isBigint = (value: unknown): value is BigInt => {
  return typeof value === 'bigint';
};

export const bigIntMax = (...args: bigint[]) =>
  args.reduce((a, b) => (a > b ? a : b));
export const bigIntMin = (...args: bigint[]) =>
  args.reduce((a, b) => (a < b ? a : b));

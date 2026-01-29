export const bigIntMax = (...args: bigint[]) =>
  args.reduce((a, b) => (a > b ? a : b));
export const bigIntMin = (...args: bigint[]) =>
  args.reduce((a, b) => (a < b ? a : b));

export const bigIntAbs = (value: bigint): bigint =>
  value < 0n ? -value : value;

export const bigIntSign = (value: bigint): 1n | -1n => {
  return value >= 0n ? 1n : -1n;
};

export const bigIntCeilDiv = (
  numerator: bigint,
  denominator: bigint,
): bigint => {
  if (denominator === 0n) {
    throw new Error('DIVISION_BY_ZERO');
  }

  const quotient = numerator / denominator;
  const remainder = numerator % denominator;

  return remainder === 0n ? quotient : quotient + 1n;
};

import { describe, expect, test } from '@jest/globals';
import { bigIntCeilDiv } from '../bigint-math.js';

describe('bigIntCeilDiv', () => {
  test('returns exact quotient when divisible', () => {
    expect(bigIntCeilDiv(10n, 2n)).toBe(5n);
  });

  test('rounds up when there is a remainder', () => {
    expect(bigIntCeilDiv(11n, 2n)).toBe(6n);
    expect(bigIntCeilDiv(15n, 4n)).toBe(4n);
  });

  test('handles zero numerator', () => {
    expect(bigIntCeilDiv(0n, 3n)).toBe(0n);
  });

  test('throws when dividing by zero', () => {
    expect(() => bigIntCeilDiv(1n, 0n)).toThrow('DIVISION_BY_ZERO');
  });
});

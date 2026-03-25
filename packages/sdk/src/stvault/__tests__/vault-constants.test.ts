import { describe, test, expect } from 'vitest';
import {
  MIN_NODE_OPERATOR_BP,
  MAX_NODE_OPERATOR_BP,
  SCAN_LIMIT,
  BASIS_POINTS_DENOMINATOR,
} from '../consts/common.js';
import { dashboardRoles } from '../consts/roles.js';

describe('stvault constants', () => {
  test('MIN_NODE_OPERATOR_BP is 0', () => {
    expect(MIN_NODE_OPERATOR_BP).toBe(0n);
  });

  test('MAX_NODE_OPERATOR_BP is 10000 (100%)', () => {
    expect(MAX_NODE_OPERATOR_BP).toBe(10_000n);
  });

  test('SCAN_LIMIT is positive', () => {
    expect(SCAN_LIMIT).toBeGreaterThan(0n);
    expect(SCAN_LIMIT).toBe(100n);
  });

  test('BASIS_POINTS_DENOMINATOR is 10000', () => {
    expect(BASIS_POINTS_DENOMINATOR).toBe(10_000n);
  });

  test('MIN < MAX for node operator fee', () => {
    expect(MIN_NODE_OPERATOR_BP).toBeLessThan(MAX_NODE_OPERATOR_BP);
  });
});

describe('dashboardRoles', () => {
  test('is a non-empty array', () => {
    expect(dashboardRoles).toBeDefined();
    expect(dashboardRoles.length).toBeGreaterThan(0);
  });

  test('contains expected core roles', () => {
    expect(dashboardRoles).toContain('DEFAULT_ADMIN_ROLE');
    expect(dashboardRoles).toContain('FUND_ROLE');
    expect(dashboardRoles).toContain('MINT_ROLE');
    expect(dashboardRoles).toContain('BURN_ROLE');
    expect(dashboardRoles).toContain('WITHDRAW_ROLE');
  });

  test('contains node operator roles', () => {
    expect(dashboardRoles).toContain('NODE_OPERATOR_MANAGER_ROLE');
    expect(dashboardRoles).toContain('NODE_OPERATOR_FEE_EXEMPT_ROLE');
  });

  test('all roles are unique strings', () => {
    const unique = new Set(dashboardRoles);
    expect(unique.size).toBe(dashboardRoles.length);
  });
});

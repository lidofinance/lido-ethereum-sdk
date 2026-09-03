import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: {
    // accessor keyword requires ES2022+ (class accessor proposal)
    target: 'es2022',
  },
  test: {
    environment: 'node',
    pool: 'forks',
    // Each worker gets its own Anvil fork (see tests/global-setup.ts) and the
    // worker count defaults to available CPUs, so all test files run on
    // parallel forks. Tune with --maxWorkers if the upstream RPC rate-limits.
    testTimeout: 120_000,
    // First request of a worker may cold-start its Anvil fork inside the
    // fork-isolation beforeAll hook.
    hookTimeout: 60_000,
    globalSetup: './tests/global-setup.ts',
    setupFiles: [
      './tests/mocks/multiformats.mock.ts',
      './tests/fork-isolation.ts',
    ],
    include: ['src/**/*.test.ts'],
    exclude: ['src/**/*-snapshot.ts', 'node_modules/**'],
  },
});

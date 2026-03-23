import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: {
    // accessor keyword requires ES2022+ (class accessor proposal)
    target: 'es2022',
  },
  test: {
    environment: 'node',
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    testTimeout: 120_000,
    globalSetup: './tests/global-setup.ts',
    setupFiles: ['./tests/mocks/multiformats.mock.ts'],
    include: ['src/**/*.test.ts'],
    exclude: ['src/**/*-snapshot.ts', 'node_modules/**'],
  },
});

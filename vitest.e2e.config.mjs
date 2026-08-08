import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@backend': `${root}backend`,
      '@': `${root}src`,
    },
  },
  test: {
    environment: 'node',
    globals: false,
    include: ['backend/e2e/**/*.e2e.js'],
    setupFiles: ['backend/e2e/support/setup.js'],
    clearMocks: true,
    fileParallelism: false,
    testTimeout: 20000,
    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage-e2e',
      reporter: ['text', 'html'],
      include: [
        'src/app/api/**/*.js',
        'backend/lib/routes/**/*.js',
        'backend/lib/http/**/*.js',
        'backend/lib/api/**/*.js',
        'backend/lib/constants.js',
      ],
      thresholds: {
        statements: 95,
        functions: 95,
        lines: 95,
        branches: 85,
      },
    },
  },
});

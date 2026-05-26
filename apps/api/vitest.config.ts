import { defineConfig } from 'vitest/config';

process.env.DB_NAME = 'wealthdash-vitest.db';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/__tests__/**/*.test.ts'],
    testTimeout: 10000,
    fileParallelism: false, // Jalankan test files secara berurutan agar cleanDatabase() tidak bentrok
  },
});

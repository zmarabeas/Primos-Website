import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.js'],
    globals: true,
    coverage: {
      provider: 'c8',
      reporter: ['text', 'lcov'],
      lines: 60,
      functions: 60,
      branches: 50,
      statements: 60
    }
  }
});
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    css: true,
    setupFiles: ['src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'src/components/**',
        'src/main.tsx',
        'src/App.tsx',
        'tailwind.config.js',
        'postcss.config.js',
        'debug-*.ts'
      ],
      thresholds: {
        statements: 80,
        lines: 80,
        functions: 80,
        branches: 70
      }
    }
  }
})


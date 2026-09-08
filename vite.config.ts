import { configDefaults, defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    exclude: [...configDefaults.exclude, 'e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'src/domain/tweet/{history,schema}.ts',
        'src/shared/lib/format.ts',
        'src/features/preview/**/*.{ts,tsx}',
      ],
      thresholds: { statements: 80, branches: 75, functions: 80, lines: 80 },
    },
  },
})

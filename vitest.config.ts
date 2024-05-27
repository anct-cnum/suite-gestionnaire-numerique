import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    coverage: {
      exclude: [],
      include: ['src/**/*'],
      provider: 'istanbul',
      skipFull: true,
      watermarks: {
        branches: [80, 100],
        functions: [80, 100],
        lines: [80, 100],
        statements: [80, 100],
      },
    },
    environment: 'jsdom',
    globals: true,
    restoreMocks: true,
    sequence: { shuffle: true },
    setupFiles: ['vitest.setup.ts'],
    unstubEnvs: true,
    unstubGlobals: true,
  },
})

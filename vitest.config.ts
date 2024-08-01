import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    {
      name: 'test-svg',
      transform(_, id) {
        if (id.endsWith('.svg')) {
          return 'export default () => {}'
        }
        return ''
      },
    },
  ],
  test: {
    coverage: {
      exclude: [
        '**/global-error.tsx',
        '**/layout.tsx',
        '**/not-found.tsx',
        '**/sentry/**',
        'src/instrumentation.ts',
        '**/Accessibilite/**',
        '**/accessibilite/**',
        '**/MentionsLegales/**',
        '**/mentions-legales/**',
        'src/**/*.test.tsx',
        'src/**/*.test.ts',
      ],
      include: ['src/**/*'],
      provider: 'istanbul',
      skipFull: true,
      watermarks: {
        branches: [90, 100],
        functions: [90, 100],
        lines: [90, 100],
        statements: [90, 100],
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

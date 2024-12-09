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
    chaiConfig: {
      truncateThreshold: 0,
    },
    coverage: {
      exclude: [
        '**/global-error.tsx',
        '**/layout.tsx',
        '**/not-found.tsx',
        '**/sentry/**',
        '**/Accessibilite/**',
        '**/accessibilite/**',
        '**/MentionsLegales/**',
        '**/mentions-legales/**',
        '**/NextAuthAuthentificationGateway.ts',
        '**/ClientContext.tsx',
        'src/instrumentation.ts',
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
    include: ['src/**/*.test.ts?(x)'],
    sequence: { shuffle: true },
    server: {
      deps: {
        inline: ['next/cache'],
      },
    },
    setupFiles: ['vitest.setup.ts'],
    unstubEnvs: true,
    unstubGlobals: true,
  },
})

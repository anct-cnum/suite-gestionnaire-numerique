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
        '**/page.tsx',
        '**/not-found.tsx',
        '**/sentry/**',
        '**/Accessibilite/**',
        '**/accessibilite/**',
        '**/MentionsLegales/**',
        '**/mentions-legales/**',
        '**/DonneesPersonnelles/**',
        '**/Notice/**',
        '**/NextAuthAuthentificationGateway.ts',
        '**/ClientContext.tsx',
        '**/Notice/**',
        '**/GouvernanceContext.tsx',
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
    globals: true,
    include: ['src/**/*.test.ts?(x)'],
    reporters: ['verbose'],
    sequence: { shuffle: true },
    server: {
      deps: {
        inline: ['next/cache'],
      },
    },
    setupFiles: ['vitest.setup.ts'],
    unstubEnvs: true,
    unstubGlobals: true,
    workspace: [
      {
        extends: true,
        test: {
          environment: 'jsdom',
          include: ['src/components/**.test.tsx'],
        },
      },
    ],
  },
})
